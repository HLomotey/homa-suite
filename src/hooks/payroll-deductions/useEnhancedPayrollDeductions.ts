import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { PayrollDeduction } from "@/integration/supabase/types/payroll-deductions";
import { debugPayrollRelationships } from "@/utils/debugPayrollRelationships";

// Enhanced PayrollDeduction type with property information
export interface EnhancedPayrollDeduction extends PayrollDeduction {
  staff_name?: string;
  home_department?: string;
  location?: string;
  property_name?: string;
  assignment_status?: string;
}

/**
 * Fetch all payroll deductions with staff and property information
 */
export const useEnhancedPayrollDeductions = () => {
  return useQuery({
    queryKey: ["enhanced-payroll-deductions"],
    queryFn: async (): Promise<EnhancedPayrollDeduction[]> => {
      // Run debug function to understand data relationships
      await debugPayrollRelationships();
      
      // First get payroll deductions
      const { data: deductions, error: deductionsError } = await (supabase
        .from("payroll_deductions") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (deductionsError) {
        console.error("Error fetching payroll deductions:", deductionsError);
        throw deductionsError;
      }

      if (!deductions || deductions.length === 0) {
        return [];
      }

      // Get unique position IDs
      const positionIds = [...new Set(deductions.map((d: any) => d.position_id))];

      // Fetch staff information for these positions
      console.log("Position IDs to lookup:", positionIds.slice(0, 5), "... (showing first 5)");
      
      const { data: staffData, error: staffError } = await supabase
        .from("external_staff")
        .select('id, "POSITION ID", "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "HOME DEPARTMENT", "LOCATION"')
        .in('"POSITION ID"', positionIds);

      if (staffError) {
        console.error("Error fetching staff data:", staffError);
        // Continue without staff data rather than failing
      } else {
        console.log("Found staff records:", staffData?.length);
        console.log("Sample staff record:", staffData?.[0]);
      }

      // Get staff IDs for assignment lookup
      const staffIds = staffData?.map((staff: any) => staff.id).filter(Boolean) || [];
      
      // Fetch assignment data to get property information
      let assignmentData: any[] = [];
      if (staffIds.length > 0) {
        console.log("Staff IDs for assignment lookup:", staffIds);
        
        const { data: assignments, error: assignmentError } = await supabase
          .from("assignments")
          .select(`
            tenant_id,
            property_id,
            property_name,
            status
          `)
          .in("tenant_id", staffIds)
          .eq("status", "Active");

        // If we have assignments with property_id, fetch property names separately
        if (assignments && assignments.length > 0) {
          const propertyIds = assignments
            .map((a: any) => a.property_id)
            .filter(Boolean);
          
          if (propertyIds.length > 0) {
            const { data: properties, error: propertiesError } = await supabase
              .from("properties")
              .select("id, title")
              .in("id", propertyIds);
            
            if (!propertiesError && properties) {
              const propertyMap = new Map(properties.map((p: any) => [p.id, p.title]));
              assignments.forEach((assignment: any) => {
                if (assignment.property_id && !assignment.property_name) {
                  assignment.property_name = propertyMap.get(assignment.property_id);
                }
              });
            }
          }
        }

        if (assignmentError) {
          console.error("Error fetching assignment data:", assignmentError);
        } else {
          assignmentData = assignments || [];
          console.log("Found assignments:", assignmentData.length);
          console.log("Sample assignment:", assignmentData[0]);
        }
      }

      // Create assignment map by tenant_id (external_staff.id)
      const assignmentMap = new Map();
      assignmentData.forEach((assignment: any) => {
        assignmentMap.set(assignment.tenant_id, {
          property_name: assignment.property_name || assignment.properties?.title || "Unknown",
          assignment_status: assignment.status
        });
      });

      // Map staff data to deductions
      const staffMap = new Map();
      staffData?.forEach((staff: any) => {
        const assignmentInfo = assignmentMap.get(staff.id);
        console.log(`Staff ${staff["POSITION ID"]} (ID: ${staff.id}) -> Assignment:`, assignmentInfo);
        
        staffMap.set(staff["POSITION ID"], {
          staff_name: `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim(),
          home_department: staff["HOME DEPARTMENT"],
          location: staff["LOCATION"],
          property_name: assignmentInfo?.property_name || "Not Assigned",
          assignment_status: assignmentInfo?.assignment_status || "No Assignment"
        });
      });

      console.log("Final staff map size:", staffMap.size);
      console.log("Assignment map size:", assignmentMap.size);

      // Combine deductions with staff and property information
      const enrichedDeductions = deductions.map((deduction: any) => ({
        ...deduction,
        staff_name: staffMap.get(deduction.position_id)?.staff_name || "Unknown",
        home_department: staffMap.get(deduction.position_id)?.home_department || "Unknown",
        location: staffMap.get(deduction.position_id)?.location || "Unknown",
        property_name: staffMap.get(deduction.position_id)?.property_name || "Not Assigned",
        assignment_status: staffMap.get(deduction.position_id)?.assignment_status || "No Assignment"
      }));

      return enrichedDeductions;
    },
  });
};
