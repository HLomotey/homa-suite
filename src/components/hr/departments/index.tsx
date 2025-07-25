import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Department } from "./DepartmentDetail";
import { DepartmentsList } from "./DepartmentsList";
import { DepartmentDetail } from "./DepartmentDetail";

// Department data
const departments: Department[] = [
  {
    id: 1,
    name: "Engineering",
    headcount: 280,
    manager: "John Smith",
    openPositions: 12,
    turnoverRate: "4.2%",
    avgTenure: "3.2 years",
    budget: "$4.2M",
    status: "Growing"
  },
  {
    id: 2,
    name: "Sales",
    headcount: 155,
    manager: "Sarah Johnson",
    openPositions: 8,
    turnoverRate: "7.5%",
    avgTenure: "2.8 years",
    budget: "$2.8M",
    status: "Stable"
  },
  {
    id: 3,
    name: "Marketing",
    headcount: 78,
    manager: "David Williams",
    openPositions: 3,
    turnoverRate: "5.1%",
    avgTenure: "2.5 years",
    budget: "$1.9M",
    status: "Growing"
  },
  {
    id: 4,
    name: "HR",
    headcount: 42,
    manager: "Lisa Brown",
    openPositions: 1,
    turnoverRate: "3.8%",
    avgTenure: "4.1 years",
    budget: "$1.2M",
    status: "Stable"
  },
  {
    id: 5,
    name: "Finance",
    headcount: 65,
    manager: "Michael Chen",
    openPositions: 2,
    turnoverRate: "3.2%",
    avgTenure: "5.3 years",
    budget: "$1.8M",
    status: "Stable"
  },
  {
    id: 6,
    name: "Operations",
    headcount: 190,
    manager: "Emily Davis",
    openPositions: 7,
    turnoverRate: "6.3%",
    avgTenure: "2.9 years",
    budget: "$3.5M",
    status: "Growing"
  },
  {
    id: 7,
    name: "Support",
    headcount: 120,
    manager: "Robert Wilson",
    openPositions: 5,
    turnoverRate: "8.2%",
    avgTenure: "2.1 years",
    budget: "$2.1M",
    status: "Needs Attention"
  }
];

export function HRDepartments() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
  };
  
  const handleCloseDepartmentDetail = () => {
    setSelectedDepartment(null);
  };
  
  return (
    <Card className="bg-background border-border">
      {selectedDepartment ? (
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
