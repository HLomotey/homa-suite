export interface Bill {
  id: string;
  staffId: string;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
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
];

export const mockBills: Bill[] = [
  {
    id: '1',
    staffId: '1',
    amount: 1200,
    type: 'Rent',
    status: 'paid',
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    staffId: '2',
    amount: 800,
    type: 'Utilities',
    status: 'pending',
    dueDate: '2024-02-20',
  },
  {
    id: '3',
    staffId: '3',
    amount: 1500,
    type: 'Maintenance',
    status: 'overdue',
    dueDate: '2024-02-10',
  },
];
