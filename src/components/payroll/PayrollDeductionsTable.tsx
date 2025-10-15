import React, { useState, useMemo } from "react";
import { useEnhancedPayrollDeductions } from "@/hooks/payroll-deductions/useEnhancedPayrollDeductions";
import { usePayrollDeductionSummary } from "@/hooks/payroll-deductions/usePayrollDeductionSummary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PayrollDeductionsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { data: deductions, isLoading, error } = useEnhancedPayrollDeductions();
  const { data: summary } = usePayrollDeductionSummary();

  // Get unique departments for filter
  const departments = useMemo(() => {
    if (!deductions) return [];
    const depts = new Set(deductions.map((d) => d.home_department).filter(Boolean));
    return Array.from(depts).sort();
  }, [deductions]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!deductions) return [];
    const locs = new Set(deductions.map((d) => d.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [deductions]);

  // Get unique periods for filter
  const periods = useMemo(() => {
    if (!deductions) return [];
    const periodSet = new Set<string>();
    
    deductions.forEach((d) => {
      if (d.start_period && d.end_period) {
        const startDate = new Date(d.start_period);
        const endDate = new Date(d.end_period);
        const periodString = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        periodSet.add(periodString);
      }
    });
    
    return Array.from(periodSet).sort();
  }, [deductions]);

  // Get unique properties for filter
  const properties = useMemo(() => {
    if (!deductions) return [];
    const props = new Set(deductions.map((d) => d.property_name).filter(Boolean));
    return Array.from(props).sort();
  }, [deductions]);

  // Filter deductions
  const filteredDeductions = useMemo(() => {
    if (!deductions) return [];

    return deductions.filter((deduction) => {
      const matchesSearch =
        searchQuery === "" ||
        deduction.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deduction.home_department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deduction.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deduction.property_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deduction.position_id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || deduction.home_department === departmentFilter;

      const matchesLocation =
        locationFilter === "all" || deduction.location === locationFilter;

      const matchesProperty =
        propertyFilter === "all" || deduction.property_name === propertyFilter;

      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        if (!deduction.start_period || !deduction.end_period) return false;
        
        const startDate = new Date(deduction.start_period);
        const endDate = new Date(deduction.end_period);
        const deductionPeriod = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        
        return deductionPeriod === periodFilter;
      })();

      return matchesSearch && matchesDepartment && matchesLocation && matchesProperty && matchesPeriod;
    });
  }, [deductions, searchQuery, departmentFilter, locationFilter, propertyFilter, periodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDeductions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeductions = filteredDeductions.slice(startIndex, endIndex);

  // Calculate filtered summary statistics
  const filteredSummary = useMemo(() => {
    if (!filteredDeductions.length) {
      return {
        total_records: 0,
        total_all_deductions: 0,
        total_rent: 0,
        total_transport: 0,
        total_bus_card: 0,
        total_security_deposit: 0
      };
    }

    return filteredDeductions.reduce((acc, deduction) => {
      const busCard = Number(deduction.bcd_bus_card_deduction) || 0;
      const securityDeposit = Number(deduction.hdd_hang_dep_ded_deduction) || 0;
      const rent = Number(deduction.rnt_rent_deduction) || 0;
      const transport = Number(deduction.trn_transport_subs_deduction) || 0;
      
      return {
        total_records: acc.total_records + 1,
        total_all_deductions: acc.total_all_deductions + busCard + securityDeposit + rent + transport,
        total_rent: acc.total_rent + rent,
        total_transport: acc.total_transport + transport,
        total_bus_card: acc.total_bus_card + busCard,
        total_security_deposit: acc.total_security_deposit + securityDeposit
      };
    }, {
      total_records: 0,
      total_all_deductions: 0,
      total_rent: 0,
      total_transport: 0,
      total_bus_card: 0,
      total_security_deposit: 0
    });
  }, [filteredDeductions]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, locationFilter, propertyFilter, periodFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading payroll deductions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading payroll deductions: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSummary.total_records}</div>
            <p className="text-xs text-muted-foreground">
              {deductions ? `of ${deductions.length} total` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredSummary.total_all_deductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Filtered selection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rent Deductions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredSummary.total_rent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              From filtered data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transport Deductions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredSummary.total_transport.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              From filtered data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Deductions</CardTitle>
          <CardDescription>
            {filteredDeductions.length} deduction records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by staff name, department, location, or position ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept!}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location!}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property} value={property!}>
                      {property}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {filteredDeductions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No payroll deductions found matching your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Position ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Bus Card</TableHead>
                      <TableHead className="text-right">Security Deposit</TableHead>
                      <TableHead className="text-right">Rent</TableHead>
                      <TableHead className="text-right">Transport</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDeductions.map((deduction) => {
                      const total =
                        (Number(deduction.bcd_bus_card_deduction) || 0) +
                        (Number(deduction.hdd_hang_dep_ded_deduction) || 0) +
                        (Number(deduction.rnt_rent_deduction) || 0) +
                        (Number(deduction.trn_transport_subs_deduction) || 0);

                      return (
                        <TableRow key={deduction.id}>
                          <TableCell className="font-medium">{deduction.staff_name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{deduction.position_id}</Badge>
                          </TableCell>
                          <TableCell>{deduction.home_department || "Unknown"}</TableCell>
                          <TableCell>{deduction.location || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{deduction.property_name || "Not Assigned"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(deduction.bcd_bus_card_deduction || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(deduction.hdd_hang_dep_ded_deduction || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(deduction.rnt_rent_deduction || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(deduction.trn_transport_subs_deduction || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {deduction.start_period && deduction.end_period
                              ? `${new Date(deduction.start_period).toLocaleDateString()} - ${new Date(deduction.end_period).toLocaleDateString()}`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredDeductions.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredDeductions.length)} of{" "}
                      {filteredDeductions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
