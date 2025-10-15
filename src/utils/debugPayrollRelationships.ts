import { supabase } from "@/integration/supabase/client";

/**
 * Debug function to test the payroll deductions to property relationships
 * This helps verify the data flow: payroll_deductions -> external_staff -> assignments -> properties
 */
export const debugPayrollRelationships = async () => {
  console.log("=== DEBUGGING PAYROLL RELATIONSHIPS ===");
  
  try {
    // Step 1: Get a sample of payroll deductions
    const { data: sampleDeductions, error: deductionsError } = await supabase
      .from("payroll_deductions")
      .select("position_id")
      .limit(5);
    
    if (deductionsError) {
      console.error("Error fetching sample deductions:", deductionsError);
      return;
    }
    
    console.log("1. Sample payroll deduction position_ids:", sampleDeductions?.map((d: any) => d.position_id));
    
    if (!sampleDeductions || sampleDeductions.length === 0) {
      console.log("No payroll deductions found");
      return;
    }
    
    // Step 2: Find external_staff records for these position_ids
    const positionIds = sampleDeductions.map((d: any) => d.position_id);
    const { data: staffRecords, error: staffError } = await supabase
      .from("external_staff")
      .select('id, "POSITION ID", "PAYROLL FIRST NAME", "PAYROLL LAST NAME"')
      .in('"POSITION ID"', positionIds);
    
    if (staffError) {
      console.error("Error fetching staff records:", staffError);
      return;
    }
    
    console.log("2. Found external_staff records:", staffRecords?.length);
    console.log("   Sample staff record:", staffRecords?.[0]);
    
    if (!staffRecords || staffRecords.length === 0) {
      console.log("No external_staff records found for these position_ids");
      return;
    }
    
    // Step 3: Find assignments for these staff members
    const staffIds = staffRecords.map((s: any) => s.id);
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("tenant_id, property_id, property_name, status")
      .in("tenant_id", staffIds);
    
    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      return;
    }
    
    console.log("3. Found assignments:", assignments?.length);
    console.log("   Sample assignment:", assignments?.[0]);
    console.log("   Active assignments:", assignments?.filter((a: any) => a.status === 'Active').length);
    
    if (!assignments || assignments.length === 0) {
      console.log("No assignments found for these staff members");
      return;
    }
    
    // Step 4: If property_id exists but property_name is null, fetch from properties table
    const assignmentsWithPropertyId = assignments.filter((a: any) => a.property_id && !a.property_name);
    if (assignmentsWithPropertyId.length > 0) {
      console.log("4. Found assignments with property_id but no property_name:", assignmentsWithPropertyId.length);
      
      const propertyIds = assignmentsWithPropertyId.map((a: any) => a.property_id);
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id, title")
        .in("id", propertyIds);
      
      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
      } else {
        console.log("   Found properties:", properties?.length);
        console.log("   Sample property:", properties?.[0]);
      }
    }
    
    // Step 5: Show the complete mapping for one example
    const firstStaff: any = staffRecords[0];
    const firstAssignment = assignments.find((a: any) => a.tenant_id === firstStaff.id);
    
    console.log("5. COMPLETE MAPPING EXAMPLE:");
    console.log("   Position ID:", firstStaff["POSITION ID"]);
    console.log("   Staff Name:", `${firstStaff["PAYROLL FIRST NAME"]} ${firstStaff["PAYROLL LAST NAME"]}`);
    console.log("   Staff UUID:", firstStaff.id);
    console.log("   Assignment:", firstAssignment);
    
  } catch (error) {
    console.error("Debug function error:", error);
  }
  
  console.log("=== END DEBUG ===");
};
