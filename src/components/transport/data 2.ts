export interface Vehicle {
  id: string;
  staffId: string;
  model: string;
  plateNumber: string;
  status: 'active' | 'maintenance' | 'repair' | 'retired';
  lastService: string;
  type: 'car' | 'truck' | 'bus' | 'van';
}

export interface Staff {
  id: string;
  name: string;
  department: string;
}

export const mockStaff: Staff[] = [
  { id: "1", name: "John Doe", department: "Engineering" },
  { id: "2", name: "Jane Smith", department: "HR" },
  { id: "3", name: "Mike Johnson", department: "Finance" },
  { id: "4", name: "Sarah Williams", department: "Operations" },
  { id: "5", name: "David Brown", department: "IT" },
];

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    staffId: '1',
    model: 'Toyota Camry',
    plateNumber: 'ABC123',
    status: 'active',
    lastService: '2024-01-15',
    type: 'car'
  },
  {
    id: '2',
    staffId: '2',
    model: 'Honda Civic',
    plateNumber: 'XYZ789',
    status: 'maintenance',
    lastService: '2024-01-20',
    type: 'car'
  },
  {
    id: '3',
    staffId: '3',
    model: 'Ford Explorer',
    plateNumber: 'DEF456',
    status: 'repair',
    lastService: '2024-01-10',
    type: 'car'
  },
  {
    id: '4',
    staffId: '4',
    model: 'Chevrolet Silverado',
    plateNumber: 'GHI789',
    status: 'active',
    lastService: '2024-02-05',
    type: 'truck'
  },
  {
    id: '5',
    staffId: '5',
    model: 'Mercedes Sprinter',
    plateNumber: 'JKL012',
    status: 'retired',
    lastService: '2023-12-20',
    type: 'van'
  },
  {
    id: '6',
    staffId: '1',
    model: 'Ford Transit',
    plateNumber: 'MNO345',
    status: 'active',
    lastService: '2024-02-10',
    type: 'bus'
  }
];
