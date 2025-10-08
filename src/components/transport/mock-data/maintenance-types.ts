import { FrontendMaintenanceType } from "@/integration/supabase/types/maintenance-type";

export const mockMaintenanceTypes: FrontendMaintenanceType[] = [
  {
    id: "1",
    name: "Oil Change",
    description: "Regular oil change service including oil filter replacement",
    category: "Routine",
    estimatedCost: 50,
    estimatedDuration: 1
  },
  {
    id: "2",
    name: "Tire Rotation",
    description: "Rotating tires to ensure even wear and extend tire life",
    category: "Routine",
    estimatedCost: 30,
    estimatedDuration: 0.5
  },
  {
    id: "3",
    name: "Brake Replacement",
    description: "Replacing brake pads and/or rotors",
    category: "Repair",
    estimatedCost: 300,
    estimatedDuration: 2
  },
  {
    id: "4",
    name: "Annual Inspection",
    description: "Complete vehicle inspection for safety and emissions",
    category: "Inspection",
    estimatedCost: 100,
    estimatedDuration: 1.5
  },
  {
    id: "5",
    name: "Battery Replacement",
    description: "Replacing vehicle battery",
    category: "Repair",
    estimatedCost: 150,
    estimatedDuration: 0.5
  },
  {
    id: "6",
    name: "Transmission Service",
    description: "Transmission fluid change and system check",
    category: "Routine",
    estimatedCost: 200,
    estimatedDuration: 2
  },
  {
    id: "7",
    name: "Air Conditioning Repair",
    description: "Diagnosis and repair of A/C system",
    category: "Repair",
    estimatedCost: 350,
    estimatedDuration: 3
  },
  {
    id: "8",
    name: "Emergency Roadside Assistance",
    description: "Towing and emergency repair services",
    category: "Emergency",
    estimatedCost: 150,
    estimatedDuration: 1
  }
];
