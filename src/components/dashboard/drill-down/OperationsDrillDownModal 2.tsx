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
  Briefcase, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  TrendingDown,
  Building,
  DollarSign,
  FileText
} from "lucide-react";

interface OperationsDrillDownModalProps {
  view: string;
  onClose: () => void;
  operationsData?: any;
}

export function OperationsDrillDownModal({ view, onClose, operationsData }: OperationsDrillDownModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Mock job order data for demonstration
  const mockJobOrders = [
    {
      id: "JO-2024-001",
      client: "Acme Corporation",
      position: "Senior Software Engineer",
      location: "New York, NY",
      status: "active",
      priority: "high",
      datePosted: "2024-08-15",
      deadline: "2024-09-30",
      salary: "$120,000 - $140,000",
      applicants: 45,
      interviewed: 12,
      hired: 0,
      recruiter: "Sarah Johnson",
      department: "Engineering"
    },
    {
      id: "JO-2024-002",
      client: "TechStart Inc",
      position: "Marketing Manager",
      location: "San Francisco, CA",
      status: "filled",
      priority: "medium",
      datePosted: "2024-07-20",
      deadline: "2024-08-25",
      salary: "$85,000 - $95,000",
      applicants: 32,
      interviewed: 8,
      hired: 1,
      recruiter: "Mike Chen",
      department: "Marketing"
    },
    {
      id: "JO-2024-003",
      client: "Global Solutions",
      position: "Sales Representative",
      location: "Chicago, IL",
      status: "active",
      priority: "medium",
      datePosted: "2024-08-25",
      deadline: "2024-10-15",
      salary: "$60,000 - $70,000",
      applicants: 28,
      interviewed: 6,
      hired: 0,
      recruiter: "Lisa Wong",
      department: "Sales"
    },
    {
      id: "JO-2024-004",
      client: "Innovation Labs",
      position: "Data Analyst",
      location: "Remote",
      status: "on-hold",
      priority: "low",
      datePosted: "2024-08-10",
      deadline: "2024-09-20",
      salary: "$70,000 - $80,000",
      applicants: 18,
      interviewed: 3,
      hired: 0,
      recruiter: "David Brown",
      department: "Analytics"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-900/40 text-green-300 border-green-800/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "filled":
        return (
          <Badge className="bg-blue-900/40 text-blue-300 border-blue-800/50">
            <Target className="h-3 w-3 mr-1" />
            Filled
          </Badge>
        );
      case "on-hold":
        return (
          <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">
            <Clock className="h-3 w-3 mr-1" />
            On Hold
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-900/40 text-red-300 border-red-800/50">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-900/40 text-red-300 border-red-800/50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-slate-900/40 text-slate-300 border-slate-800/50">
            Low Priority
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderJobOrdersList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Job Orders Management</h3>
          <p className="text-sm text-muted-foreground">Active job orders and placement tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            New Job Order
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {mockJobOrders
          .filter(job => 
            (filterStatus === "all" || job.status === filterStatus) &&
            (filterPriority === "all" || job.priority === filterPriority) &&
            (searchTerm === "" || 
             job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((job) => (
            <Card key={job.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{job.id}</h4>
                      {getStatusBadge(job.status)}
                      {getPriorityBadge(job.priority)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {job.position}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {job.client}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Deadline: {job.deadline}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Recruiter: {job.recruiter}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span>Applicants: <span className="text-white font-medium">{job.applicants}</span></span>
                      <span>Interviewed: <span className="text-white font-medium">{job.interviewed}</span></span>
                      <span>Hired: <span className="text-white font-medium">{job.hired}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">Operational efficiency and KPI analysis</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fill Rate by Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Engineering</span>
              <span className="font-medium text-green-400">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sales</span>
              <span className="font-medium text-blue-400">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Marketing</span>
              <span className="font-medium text-yellow-400">72%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Time to Fill Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium text-white">28 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Month</span>
              <span className="font-medium text-white">32 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Improvement</span>
              <span className="font-medium text-green-400">-4 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Client Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overall Rating</span>
              <span className="font-medium text-white">4.6/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="font-medium text-green-400">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Repeat Clients</span>
              <span className="font-medium text-blue-400">68%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPlacementAnalysis = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Placement Analysis</h3>
          <p className="text-sm text-muted-foreground">Successful placements and candidate tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Placement Rate</p>
                <p className="text-2xl font-bold text-white">76.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">+3.2% from last quarter</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidate Retention</p>
                <p className="text-2xl font-bold text-white">89.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">+1.8% improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Interview Rate</p>
                <p className="text-2xl font-bold text-white">34.7%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-red-500 mt-1">-2.1% from target</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Client Renewals</p>
                <p className="text-2xl font-bold text-white">82.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">+5.3% increase</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getViewTitle = () => {
    switch (view) {
      case "job-orders":
        return "Job Orders Management";
      case "fill-rate":
        return "Fill Rate Analysis";
      case "days-to-fill":
        return "Time to Fill Report";
      case "placement-rate":
        return "Placement Performance";
      case "performance-metrics":
        return "Operations Performance";
      default:
        return "Operations Details";
    }
  };

  const renderContent = () => {
    switch (view) {
      case "job-orders":
        return renderJobOrdersList();
      case "fill-rate":
      case "days-to-fill":
        return renderPerformanceMetrics();
      case "placement-rate":
        return renderPlacementAnalysis();
      default:
        return renderJobOrdersList();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">{getViewTitle()}</h2>
            <p className="text-sm text-muted-foreground">Detailed operations analysis and job order insights</p>
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
