// Settings data types and mock data

// Data Source types
export interface DataSource {
  id: string;
  name: string;
  type: string;
  connectionId: string;
  connectionName: string;
  lastUpdated: string;
  recordCount: number;
  status: "available" | "syncing" | "error";
}

export interface Connection {
  id: string;
  name: string;
}

// ADP Integration types
export interface ADPConnectionStatus {
  success: boolean;
  message: string;
}

// Mock data for Settings
export const mockDataSources: DataSource[] = [
  {
    id: "1",
    name: "Customer Data",
    type: "REST API Endpoint",
    connectionId: "1",
    connectionName: "CRM System",
    lastUpdated: "2025-07-15T14:30:00Z",
    recordCount: 1243,
    status: "available",
  },
  {
    id: "2",
    name: "Sales Transactions",
    type: "Database Table",
    connectionId: "2",
    connectionName: "ERP Integration",
    lastUpdated: "2025-07-10T09:15:00Z",
    recordCount: 5678,
    status: "available",
  },
  {
    id: "3",
    name: "User Analytics",
    type: "GraphQL Query",
    connectionId: "3",
    connectionName: "Analytics Platform",
    lastUpdated: "2025-07-14T18:45:00Z",
    recordCount: 0,
    status: "error",
  },
];

export const mockConnections: Connection[] = [
  { id: "1", name: "CRM System" },
  { id: "2", name: "ERP Integration" },
  { id: "3", name: "Analytics Platform" },
];

// Mock ADP API service
export class ADPService {
  private clientId: string;
  private clientSecret: string;
  private productType: string;

  constructor(credentials: { clientId: string; clientSecret: string }, productType: string) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.productType = productType;
  }

  async testConnection(): Promise<ADPConnectionStatus> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success/failure based on credentials
    if (this.clientId && this.clientSecret) {
      return {
        success: true,
        message: "Successfully connected to ADP API"
      };
    } else {
      return {
        success: false,
        message: "Invalid credentials"
      };
    }
  }

  async getWorkers() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      workers: [
        { id: "W1", name: "John Doe", position: "Developer", department: "Engineering" },
        { id: "W2", name: "Jane Smith", position: "Designer", department: "Product" },
        { id: "W3", name: "Mike Johnson", position: "Manager", department: "Operations" }
      ]
    };
  }

  async getPayrollData() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      payroll: {
        period: "July 2025",
        totalGross: 125000,
        totalNet: 87500,
        employees: 25,
        transactions: [
          { id: "P1", employeeId: "W1", amount: 5000, date: "2025-07-15" },
          { id: "P2", employeeId: "W2", amount: 4800, date: "2025-07-15" },
          { id: "P3", employeeId: "W3", amount: 6500, date: "2025-07-15" }
        ]
      }
    };
  }

  async getTimeAndAttendance(startDate: string, endDate: string) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      timeframe: { startDate, endDate },
      records: [
        { employeeId: "W1", date: "2025-07-15", hoursWorked: 8, overtime: 0 },
        { employeeId: "W2", date: "2025-07-15", hoursWorked: 7.5, overtime: 0 },
        { employeeId: "W3", date: "2025-07-15", hoursWorked: 9, overtime: 1 }
      ]
    };
  }

  async getBenefitsData() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      benefits: [
        { type: "Health Insurance", coverage: "Family", cost: 500, employerContribution: 400 },
        { type: "Dental Insurance", coverage: "Family", cost: 100, employerContribution: 80 },
        { type: "401k", employeeContribution: "5%", employerMatch: "4%" }
      ]
    };
  }
}
