import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter,
  Home,
  Car,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FrontendStaffBenefit, 
  BenefitType, 
  BenefitStatus 
} from "@/integration/supabase/types/staff-benefits";
import { useStaffBenefits } from "@/hooks/staff-benefits/useStaffBenefits";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface StaffBenefitsListProps {
  onAddBenefit: () => void;
  onEditBenefit: (benefit: FrontendStaffBenefit) => void;
  onViewBenefit: (benefit: FrontendStaffBenefit) => void;
}

export const StaffBenefitsList: React.FC<StaffBenefitsListProps> = ({
  onAddBenefit,
  onEditBenefit,
  onViewBenefit,
}) => {
  const { 
    benefits, 
    loading, 
    stats, 
    fetchBenefits, 
    deleteBenefit, 
    approveBenefit, 
    suspendBenefit 
  } = useStaffBenefits();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BenefitStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BenefitType | "all">("all");

  // Group benefits by staff member and filter
  const groupedBenefits = benefits.reduce((acc, benefit) => {
    const staffId = benefit.staff_id;
    if (!acc[staffId]) {
      acc[staffId] = {
        staff_id: staffId,
        staff_name: benefit.staff_name,
        staff_email: benefit.staff_email,
        staff_department: benefit.staff_department,
        staff_job_title: benefit.staff_job_title,
        staff_location_name: benefit.staff_location_name,
        benefits: [],
        benefit_types: [],
        statuses: [],
        effective_date: benefit.effective_date,
        notes: benefit.notes
      };
    }
    acc[staffId].benefits.push(benefit);
    acc[staffId].benefit_types.push(benefit.benefit_type);
    acc[staffId].statuses.push(benefit.status);
    return acc;
  }, {} as Record<string, {
    staff_id: string;
    staff_name: string | null;
    staff_email: string | null;
    staff_department: string | null;
    staff_job_title: string | null;
    staff_location_name: string | null;
    benefits: FrontendStaffBenefit[];
    benefit_types: BenefitType[];
    statuses: BenefitStatus[];
    effective_date: string;
    notes: string | null;
  }>);

  const filteredBenefits = Object.values(groupedBenefits).filter((staffBenefits) => {
    const matchesSearch = 
      staffBenefits.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffBenefits.staff_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffBenefits.staff_department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffBenefits.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || staffBenefits.statuses.includes(statusFilter);
    const matchesType = typeFilter === "all" || staffBenefits.benefit_types.includes(typeFilter);

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (benefit: FrontendStaffBenefit) => {
    if (window.confirm(`Are you sure you want to delete this benefit for ${benefit.staff_name}?`)) {
      const success = await deleteBenefit(benefit.id);
      if (success) {
        await fetchBenefits();
      }
    }
  };

  const handleApprove = async (benefit: FrontendStaffBenefit) => {
    const success = await approveBenefit(benefit.id);
    if (success) {
      await fetchBenefits();
    }
  };

  const handleSuspend = async (benefit: FrontendStaffBenefit) => {
    const success = await suspendBenefit(benefit.id);
    if (success) {
      await fetchBenefits();
    }
  };

  const getBenefitTypeIcon = (type: BenefitType) => {
    switch (type) {
      case "housing":
        return <Home className="h-4 w-4" />;
      case "transportation":
        return <Car className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: BenefitStatus) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "suspended":
        return <Pause className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadgeVariant = (status: BenefitStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "outline";
      case "suspended":
        return "destructive";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
            <Badge variant="outline">{stats.total}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Benefits</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transportation Benefits</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.transportationBenefits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Benefits</CardTitle>
              <CardDescription>
                Manage housing and transportation benefits for staff members
              </CardDescription>
            </div>
            <Button onClick={onAddBenefit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff, department, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BenefitStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as BenefitType | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading benefits...</div>
            </div>
          ) : filteredBenefits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-muted-foreground mb-2">No benefits found</div>
              <Button variant="outline" onClick={onAddBenefit}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Benefit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBenefits.map((staffBenefits) => (
                <div
                  key={staffBenefits.staff_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {staffBenefits.benefit_types.includes("housing") && getBenefitTypeIcon("housing")}
                        {staffBenefits.benefit_types.includes("transportation") && getBenefitTypeIcon("transportation")}
                      </div>
                      <div>
                        <div className="font-medium">
                          {staffBenefits.staff_name || "Unknown Staff"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {staffBenefits.staff_department} • {staffBenefits.staff_job_title}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {staffBenefits.benefit_types.map(type => 
                          type.charAt(0).toUpperCase() + type.slice(1)
                        ).join(" & ")} Required
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Benefit Type{staffBenefits.benefit_types.length > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col space-y-1">
                        {staffBenefits.benefits.map((benefit, index) => (
                          <div key={benefit.id} className="flex items-center space-x-2">
                            {getStatusIcon(benefit.status)}
                            <Badge variant={getStatusBadgeVariant(benefit.status)}>
                              {benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <div>Effective: {format(new Date(staffBenefits.effective_date), "MMM dd, yyyy")}</div>
                      {staffBenefits.benefits[0]?.expiry_date && (
                        <div>Expires: {format(new Date(staffBenefits.benefits[0].expiry_date), "MMM dd, yyyy")}</div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {staffBenefits.benefits.map((benefit) => (
                          <div key={benefit.id}>
                            <DropdownMenuItem onClick={() => onViewBenefit(benefit)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View {benefit.benefit_type.charAt(0).toUpperCase() + benefit.benefit_type.slice(1)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditBenefit(benefit)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit {benefit.benefit_type.charAt(0).toUpperCase() + benefit.benefit_type.slice(1)}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {benefit.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleApprove(benefit)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve {benefit.benefit_type.charAt(0).toUpperCase() + benefit.benefit_type.slice(1)}
                              </DropdownMenuItem>
                            )}
                            {benefit.status === "active" && (
                              <DropdownMenuItem onClick={() => handleSuspend(benefit)}>
                                <Pause className="mr-2 h-4 w-4" />
                                Suspend {benefit.benefit_type.charAt(0).toUpperCase() + benefit.benefit_type.slice(1)}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(benefit)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete {benefit.benefit_type.charAt(0).toUpperCase() + benefit.benefit_type.slice(1)}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffBenefitsList;
