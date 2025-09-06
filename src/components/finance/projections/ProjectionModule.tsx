import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent } from '@/components/ui/custom-ui';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  BarChart3,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useProjections } from '@/hooks/projection/useProjections';
import { ProjectionWithDetails, ProjectionStatus, ProjectionPriority } from '@/types/projection';
import BulkProjectionForm from './BulkProjectionForm';
import ProjectionDashboard from './ProjectionDashboard';

const ProjectionModule = () => {
  const { projections, loading, error, createProjection, updateProjection, deleteProjection } = useProjections();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjection, setSelectedProjection] = useState<ProjectionWithDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectionStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<ProjectionPriority | 'ALL'>('ALL');

  // Filter projections based on search and filters
  const filteredProjections = projections.filter(projection => {
    const matchesSearch = projection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projection.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projection.location_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || projection.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || projection.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateProjection = () => {
    setSelectedProjection(null);
    setIsFormOpen(true);
  };

  const handleEditProjection = (projection: ProjectionWithDetails) => {
    setSelectedProjection(projection);
    setIsFormOpen(true);
  };

  const handleViewProjection = (projection: ProjectionWithDetails) => {
    setSelectedProjection(projection);
    setIsViewDialogOpen(true);
  };

  const handleDeleteProjection = (projection: ProjectionWithDetails) => {
    setSelectedProjection(projection);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (Array.isArray(data)) {
        // Bulk creation
        for (const projection of data) {
          await createProjection(projection);
        }
        toast.success(`${data.length} projections created successfully`);
      } else {
        // Single projection update/create
        if (selectedProjection) {
          await updateProjection(selectedProjection.id, data);
          toast.success('Projection updated successfully');
        } else {
          await createProjection(data);
          toast.success('Projection created successfully');
        }
      }
      setIsFormOpen(false);
      setSelectedProjection(null);
    } catch (error) {
      toast.error('Failed to save projection');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedProjection(null);
  };

  const confirmDelete = async () => {
    if (selectedProjection) {
      await deleteProjection(selectedProjection.id);
      setIsDeleteDialogOpen(false);
      setSelectedProjection(null);
    }
  };

  const getStatusBadgeVariant = (status: ProjectionStatus) => {
    switch (status) {
      case 'DRAFT': return 'secondary';
      case 'ACTIVE': return 'default';
      case 'UNDER_REVIEW': return 'outline';
      case 'APPROVED': return 'default';
      case 'ARCHIVED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: ProjectionPriority) => {
    switch (priority) {
      case 'LOW': return 'secondary';
      case 'MEDIUM': return 'outline';
      case 'HIGH': return 'default';
      case 'URGENT': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading projections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading projections: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projections Management</h1>
          <p className="text-muted-foreground">
            Manage organizational projections with location-based billing and revenue tracking
          </p>
        </div>
        <Button onClick={handleCreateProjection} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Projection
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Projections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <ProjectionDashboard />
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                All Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectionStatus | 'ALL')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ProjectionPriority | 'ALL')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Projections Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Billing Period</TableHead>
                      <TableHead>Expected Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Projection Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <TrendingUp className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">No projections found</p>
                            <Button onClick={handleCreateProjection} size="sm">
                              Create your first projection
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProjections.map((projection) => (
                        <TableRow key={projection.id}>
                          <TableCell className="font-medium">
                            {projection.title}
                          </TableCell>
                          <TableCell>{projection.location_description}</TableCell>
                          <TableCell>{projection.billing_period_name}</TableCell>
                          <TableCell>
                            ${projection.expected_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(projection.status)}>
                              {projection.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityBadgeVariant(projection.priority)}>
                              {projection.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {format(new Date(projection.projection_date), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProjection(projection)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProjection(projection)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProjection(projection)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <BulkProjectionForm
            projection={selectedProjection}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* View Sheet */}
      <Sheet open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          {selectedProjection && (
            <BulkProjectionForm
              projection={selectedProjection}
              onCancel={() => setIsViewDialogOpen(false)}
              readOnly={true}
            />
          )}
        </SheetContent>
      </Sheet>

      <div className={`fixed inset-0 z-50 ${isDeleteDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsDeleteDialogOpen(false)} />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
          <h2 className="text-lg font-semibold mb-2">Delete Projection</h2>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this projection? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (selectedProjection) {
                  await deleteProjection(selectedProjection.id);
                  setIsDeleteDialogOpen(false);
                  setSelectedProjection(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionModule;
