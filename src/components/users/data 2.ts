// User Management data types and mock data

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff" | "guest";
  department: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  avatar?: string;
  permissions: string[];
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headCount: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Mock data for users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    department: "IT",
    status: "active",
    lastActive: "2025-07-25T10:30:00Z",
    permissions: ["users.view", "users.create", "users.edit", "users.delete", "settings.view", "settings.edit"],
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "manager",
    department: "HR",
    status: "active",
    lastActive: "2025-07-24T16:45:00Z",
    avatar: "https://i.pravatar.cc/150?u=jane",
    permissions: ["users.view", "users.create", "users.edit", "settings.view"],
    createdAt: "2024-02-10T09:15:00Z"
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "staff",
    department: "Finance",
    status: "active",
    lastActive: "2025-07-25T08:20:00Z",
    permissions: ["users.view", "settings.view"],
    createdAt: "2024-03-05T11:30:00Z"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "staff",
    department: "Operations",
    status: "inactive",
    lastActive: "2025-07-15T14:10:00Z",
    avatar: "https://i.pravatar.cc/150?u=emily",
    permissions: ["users.view", "settings.view"],
    createdAt: "2024-04-20T10:45:00Z"
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "manager",
    department: "Sales",
    status: "active",
    lastActive: "2025-07-24T11:55:00Z",
    permissions: ["users.view", "users.create", "users.edit", "settings.view"],
    createdAt: "2024-05-12T13:20:00Z"
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    role: "staff",
    department: "Marketing",
    status: "pending",
    lastActive: "2025-07-20T09:30:00Z",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    permissions: ["users.view", "settings.view"],
    createdAt: "2024-06-08T15:10:00Z"
  },
  {
    id: "7",
    name: "David Miller",
    email: "david.miller@example.com",
    role: "guest",
    department: "External",
    status: "active",
    lastActive: "2025-07-23T16:40:00Z",
    permissions: ["users.view"],
    createdAt: "2024-07-01T08:45:00Z"
  }
];

// Mock data for departments
export const mockDepartments: Department[] = [
  { id: "1", name: "IT", description: "Information Technology", headCount: 12 },
  { id: "2", name: "HR", description: "Human Resources", headCount: 8 },
  { id: "3", name: "Finance", description: "Finance and Accounting", headCount: 15 },
  { id: "4", name: "Operations", description: "Operations Management", headCount: 20 },
  { id: "5", name: "Sales", description: "Sales and Business Development", headCount: 18 },
  { id: "6", name: "Marketing", description: "Marketing and Communications", headCount: 10 },
  { id: "7", name: "External", description: "External Partners and Contractors", headCount: 5 }
];

// Mock data for roles
export const mockRoles: Role[] = [
  { 
    id: "1", 
    name: "admin", 
    description: "Full system access with all permissions", 
    permissions: ["users.view", "users.create", "users.edit", "users.delete", "settings.view", "settings.edit", "billing.view", "billing.edit"]
  },
  { 
    id: "2", 
    name: "manager", 
    description: "Department management with user creation permissions", 
    permissions: ["users.view", "users.create", "users.edit", "settings.view", "billing.view"]
  },
  { 
    id: "3", 
    name: "staff", 
    description: "Regular staff with limited permissions", 
    permissions: ["users.view", "settings.view"]
  },
  { 
    id: "4", 
    name: "guest", 
    description: "External users with minimal access", 
    permissions: ["users.view"]
  }
];

// Mock data for permissions
export const mockPermissions: Permission[] = [
  { id: "1", name: "users.view", description: "View users and their details", category: "Users" },
  { id: "2", name: "users.create", description: "Create new users", category: "Users" },
  { id: "3", name: "users.edit", description: "Edit existing users", category: "Users" },
  { id: "4", name: "users.delete", description: "Delete users", category: "Users" },
  { id: "5", name: "settings.view", description: "View system settings", category: "Settings" },
  { id: "6", name: "settings.edit", description: "Edit system settings", category: "Settings" },
  { id: "7", name: "billing.view", description: "View billing information", category: "Billing" },
  { id: "8", name: "billing.edit", description: "Edit billing information", category: "Billing" }
];
