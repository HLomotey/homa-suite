import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  Search, 
  Download, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Star
} from "lucide-react";

interface HRDrillDownModalProps {
  isOpen: boolean;
  view: string;
  onClose: () => void;
  hrData?: any;
}

export function HRDrillDownModal({ isOpen, view, onClose, hrData }: HRDrillDownModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Use real employee data from hrData prop
  const employees = hrData?.employees || [];
  
  // Get unique departments and statuses for filters
  const departments = [...new Set(employees.map((emp: any) => emp.department))];
  const statuses = [...new Set(employees.map((emp: any) => emp.status))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-900/40 text-green-300 border-green-800/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-900/40 text-red-300 border-red-800/50">
            <UserX className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case "on-leave":
        return (
          <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">
            <Clock className="h-3 w-3 mr-1" />
            On Leave
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return (
          <Badge className="bg-green-900/40 text-green-300 border-green-800/50">
            <Star className="h-3 w-3 mr-1" />
            Excellent
          </Badge>
        );
      case "good":
        return (
          <Badge className="bg-blue-900/40 text-blue-300 border-blue-800/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Good
          </Badge>
        );
      case "needs-improvement":
        return (
          <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Needs Improvement
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderEmployeeDirectory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Employee Directory</h3>
          <p className="text-sm text-muted-foreground">Complete staff roster with contact details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            Add Employee
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {employees
          .filter(employee => 
            (filterDepartment === "all" || employee.department === filterDepartment) &&
            (filterStatus === "all" || employee.status === filterStatus) &&
            (searchTerm === "" || 
             employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             employee.department.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((employee) => (
            <Card key={employee.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{employee.name}</h4>
                      {getStatusBadge(employee.status)}
                      {getPerformanceBadge(employee.performance)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {employee.position}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {employee.department}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {employee.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Hired: {employee.hireDate}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Manager: {employee.manager}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance Analysis</h3>
          <p className="text-sm text-muted-foreground">Employee performance metrics and trends</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Excellent</span>
              <span className="font-medium text-green-400">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Good</span>
              <span className="font-medium text-blue-400">38%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Needs Improvement</span>
              <span className="font-medium text-yellow-400">17%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engineering</span>
              <span className="font-medium text-white">4.2/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sales</span>
              <span className="font-medium text-white">4.0/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Marketing</span>
              <span className="font-medium text-white">3.8/5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Review Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-medium text-green-400">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-medium text-yellow-400">15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overdue</span>
              <span className="font-medium text-red-400">7%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Attendance Analysis</h3>
          <p className="text-sm text-muted-foreground">Employee attendance patterns and trends</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">+1.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sick Leave Usage</p>
                <p className="text-2xl font-bold text-white">3.8%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">-0.5% improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold text-white">2.1%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">-0.3% improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remote Work</p>
                <p className="text-2xl font-bold text-white">28.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-500 mt-1">+2.1% increase</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getViewTitle = () => {
    switch (view) {
      case "total-employees":
        return "Employee Directory";
      case "active-employees":
        return "Active Employees";
      case "inactive-employees":
        return "Inactive Employees";
      case "attendance-rate":
        return "Attendance Analysis";
      case "performance-metrics":
        return "Performance Analysis";
      case "employee-satisfaction":
        return "Employee Satisfaction Report";
      default:
        return "HR Details";
    }
  };

  const renderContent = () => {
    switch (view) {
      case "total-employees":
      case "active-employees":
      case "inactive-employees":
        return renderEmployeeDirectory();
      case "performance-metrics":
      case "employee-satisfaction":
        return renderPerformanceAnalysis();
      case "attendance-rate":
        return renderAttendanceReport();
      default:
        return renderEmployeeDirectory();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">{getViewTitle()}</h2>
            <p className="text-sm text-muted-foreground">Detailed HR analysis and employee insights</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
