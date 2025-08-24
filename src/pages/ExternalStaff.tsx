import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, 
  Search, 
  Upload, 
  Users, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ExternalStaffExcelUpload } from '../components/external-staff/ExternalStaffExcelUpload';
import { ExternalStaffSlideForm } from '../components/external-staff/ExternalStaffSlideForm';
import { useExternalStaff, useDeleteExternalStaff } from '../hooks/external-staff/useExternalStaff';
import { FrontendExternalStaff } from '../integration/supabase/types/external-staff';

const ExternalStaff: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<FrontendExternalStaff | null>(null);
  const [showSlideForm, setShowSlideForm] = useState(false);

  const { externalStaff, loading, error, refetch } = useExternalStaff();
  const { deleteStaff, loading: deleteLoading } = useDeleteExternalStaff();

  // Filter staff based on search term
  const filteredStaff = externalStaff.filter(staff => 
    staff.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.eMail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.externalStaffId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (staff: FrontendExternalStaff) => {
    setSelectedStaff(staff);
    setShowSlideForm(true);
  };

  const handleDelete = async (staff: FrontendExternalStaff) => {
    if (window.confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}?`)) {
      try {
        await deleteStaff(staff.id);
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowSlideForm(false);
    setSelectedStaff(null);
    refetch();
  };

  const handleNewStaff = () => {
    setSelectedStaff(null);
    setShowSlideForm(true);
  };

  const getEmploymentStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const variant = status === 'Active' ? 'default' : 
                   status === 'Inactive' ? 'secondary' : 
                   status === 'Terminated' ? 'destructive' : 'outline';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">External Staff</h1>
          <p className="text-muted-foreground">
            Manage external staff data with 31-column structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewStaff} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{externalStaff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {externalStaff.filter(s => s.employmentStatus === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(externalStaff.map(s => s.department).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {externalStaff.filter(s => {
                if (!s.createdAt) return false;
                const created = new Date(s.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Staff List</TabsTrigger>
          <TabsTrigger value="upload">Excel Upload</TabsTrigger>
        </TabsList>

        {/* Staff List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Staff Table */}
          <Card>
            <CardHeader>
              <CardTitle>External Staff ({filteredStaff.length})</CardTitle>
              <CardDescription>
                Manage your external staff records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading staff...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">Error: {error}</div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No staff found matching your search.' : 'No external staff records found.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>External ID</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">
                          {staff.firstName} {staff.lastName}
                        </TableCell>
                        <TableCell>{staff.eMail || '-'}</TableCell>
                        <TableCell>{staff.department || '-'}</TableCell>
                        <TableCell>{staff.position || '-'}</TableCell>
                        <TableCell>
                          {getEmploymentStatusBadge(staff.employmentStatus)}
                        </TableCell>
                        <TableCell>{staff.externalStaffId || '-'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(staff)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(staff)}
                                className="text-red-600"
                                disabled={deleteLoading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Excel Upload Tab */}
        <TabsContent value="upload">
          <ExternalStaffExcelUpload 
            onUploadComplete={(result) => {
              if (result.success) {
                refetch();
                setActiveTab('list');
              }
            }}
          />
        </TabsContent>

      </Tabs>

      {/* Slide-in Form */}
      <ExternalStaffSlideForm
        open={showSlideForm}
        onOpenChange={setShowSlideForm}
        staff={selectedStaff || undefined}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default ExternalStaff;
