import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Card } from "@/components/ui/card";
import { Department } from "./DepartmentDetail";
import { DepartmentsList } from "./DepartmentsList";
import { DepartmentDetail } from "./DepartmentDetail";

// Default department managers and other data that isn't in the external staff data
const departmentManagers: Record<string, string> = {
  "Engineering": "John Smith",
  "Sales": "Sarah Johnson",
  "Marketing": "David Williams",
  "HR": "Lisa Brown",
  "Finance": "Michael Chen",
  "Operations": "Emily Davis",
  "Support": "Robert Wilson",
  "IT": "James Rodriguez",
  "Legal": "Patricia Lee",
  "Research": "Thomas Wright"
};

const departmentBudgets: Record<string, string> = {
  "Engineering": "$4.2M",
  "Sales": "$2.8M",
  "Marketing": "$1.9M",
  "HR": "$1.2M",
  "Finance": "$1.8M",
  "Operations": "$3.5M",
  "Support": "$2.1M",
  "IT": "$3.0M",
  "Legal": "$1.5M",
  "Research": "$2.5M"
};

export function HRDepartments() {
  const { externalStaff, statsLoading } = useExternalStaff();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      setLoading(true);
      
      // Filter to only active staff (no termination date)
      const activeStaff = externalStaff.filter(staff => !staff["TERMINATION DATE"]);
      
      // Group active staff by department, combining all STAFF departments
      const departmentMap = new Map<string, any[]>();
      
      activeStaff.forEach(staff => {
        let department = staff["HOME DEPARTMENT"] || "Unassigned";
        
        // Group all departments containing "STAFF" under one category
        if (department.toUpperCase().includes("STAFF")) {
          department = "STAFF";
        }
        
        if (!departmentMap.has(department)) {
          departmentMap.set(department, []);
        }
        departmentMap.get(department)?.push(staff);
      });
      
      // Calculate department statistics
      const departmentsData: Department[] = [];
      let id = 1;
      
      departmentMap.forEach((staffList, departmentName) => {
        // Skip departments with no staff
        if (staffList.length === 0) return;
        
        // Since we're only using active staff, calculate turnover based on historical data
        // Get all staff (including terminated) for this department to calculate turnover
        const allDepartmentStaff = externalStaff.filter(staff => {
          let dept = staff["HOME DEPARTMENT"] || "Unassigned";
          if (dept.toUpperCase().includes("STAFF")) {
            dept = "STAFF";
          }
          return dept === departmentName;
        });
        
        const terminatedStaff = allDepartmentStaff.filter(staff => staff["TERMINATION DATE"]);
        const turnoverRate = allDepartmentStaff.length > 0 ? 
          ((terminatedStaff.length / allDepartmentStaff.length) * 100).toFixed(1) + "%" : "0.0%";
        
        // Calculate average tenure in years
        const now = new Date();
        let totalTenure = 0;
        staffList.forEach(staff => {
          if (staff["HIRE DATE"]) {
            const hireDate = new Date(staff["HIRE DATE"]);
            const tenureMs = staff["TERMINATION DATE"] ? 
              new Date(staff["TERMINATION DATE"]).getTime() - hireDate.getTime() : 
              now.getTime() - hireDate.getTime();
            const tenureYears = tenureMs / (1000 * 60 * 60 * 24 * 365.25);
            totalTenure += tenureYears;
          }
        });
        const avgTenure = (totalTenure / staffList.length).toFixed(1) + " years";
        
        // Determine department status based on growth (using all staff for accurate assessment)
        let status = "Stable";
        const recentHires = allDepartmentStaff.filter(staff => {
          if (staff["HIRE DATE"]) {
            const hireDate = new Date(staff["HIRE DATE"]);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            return hireDate >= threeMonthsAgo;
          }
          return false;
        });
        
        if (recentHires.length > allDepartmentStaff.length * 0.1) {
          status = "Growing";
        } else if (terminatedStaff.length > allDepartmentStaff.length * 0.1) {
          status = "Needs Attention";
        }
        
        departmentsData.push({
          id: id++,
          name: departmentName,
          headcount: staffList.length,
          manager: departmentManagers[departmentName] || "Unassigned",
          openPositions: Math.floor(Math.random() * 10) + 1, // Placeholder for open positions
          turnoverRate,
          avgTenure,
          budget: departmentBudgets[departmentName] || "$1.0M",
          status
        });
      });
      
      // Sort departments by headcount (largest first)
      departmentsData.sort((a, b) => b.headcount - a.headcount);
      
      setDepartments(departmentsData);
      setLoading(false);
    }
  }, [externalStaff, statsLoading]);
  
  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
  };
  
  const handleCloseDepartmentDetail = () => {
    setSelectedDepartment(null);
  };
  
  return (
    <Card className="bg-background border-border">
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading department data...</p>
        </div>
      ) : selectedDepartment ? (
        <DepartmentDetail 
          department={selectedDepartment} 
          onClose={handleCloseDepartmentDetail} 
        />
      ) : (
        <DepartmentsList 
          departments={departments} 
          onSelectDepartment={handleSelectDepartment} 
        />
      )}
    </Card>
  );
}
