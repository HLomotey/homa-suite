import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoute } from "@/hooks/transport/useRoute";
import { useCombinedRoute } from "@/hooks/transport/useCombinedRoute";
import { useRouteAssignment } from "@/hooks/transport/useRouteAssignment";
import { RouteForm } from "./RouteForm";
import { CombinedRouteForm } from "./CombinedRouteForm";
import { RouteAssignmentForm } from "./RouteAssignmentForm";
import { RouteExecutionForm } from "./RouteExecutionForm";
import { 
  FrontendRoute, 
  FrontendCombinedRoute, 
  FrontendRouteAssignment,
  FrontendRouteExecutionLog
} from "@/integration/supabase/types/transport-route";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Route as RouteIcon,
  Calendar,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth";
import { format } from "date-fns";

// Mock user roles for demonstration
const USER_ROLE = {
  MANAGER: 'manager',
  DRIVER: 'driver'
};

export function RouteManagement() {
  // For demonstration, we'll use a mock user role
  // In a real app, this would come from authentication
  const [userRole, setUserRole] = useState(USER_ROLE.MANAGER);
  const { user } = useAuth();
  
  // State for routes tab
  const { 
    routes, 
    loading: routesLoading, 
    error: routesError,
    fetchAllRoutes,
    addRoute,
    editRoute,
    removeRoute
  } = useRoute();
  
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<FrontendRoute | null>(null);
  const [deleteRouteDialogOpen, setDeleteRouteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  
  // State for combined routes tab
  const {
    combinedRoutes,
    loading: combinedRoutesLoading,
    error: combinedRoutesError,
    fetchAllCombinedRoutes,
    addCombinedRoute,
    editCombinedRoute,
    removeCombinedRoute
  } = useCombinedRoute();
  
  const [combinedRouteFormOpen, setCombinedRouteFormOpen] = useState(false);
  const [editingCombinedRoute, setEditingCombinedRoute] = useState<FrontendCombinedRoute | null>(null);
  const [deleteCombinedRouteDialogOpen, setDeleteCombinedRouteDialogOpen] = useState(false);
  const [combinedRouteToDelete, setCombinedRouteToDelete] = useState<string | null>(null);
  
  // State for assignments tab
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    fetchAllAssignments,
    fetchAssignmentsByDriver,
    addAssignment,
    editAssignment,
    removeAssignment,
    startRouteExecution,
    completeRouteExecution
  } = useRouteAssignment();
  
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<FrontendRouteAssignment | null>(null);
  const [deleteAssignmentDialogOpen, setDeleteAssignmentDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  
  // State for route execution
  const [executionFormOpen, setExecutionFormOpen] = useState(false);
  const [executionFormMode, setExecutionFormMode] = useState<'start' | 'update'>('start');
  const [selectedAssignment, setSelectedAssignment] = useState<FrontendRouteAssignment | null>(null);
  const [selectedExecutionLog, setSelectedExecutionLog] = useState<FrontendRouteExecutionLog | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    fetchAllRoutes();
    fetchAllCombinedRoutes();
    
    if (userRole === USER_ROLE.MANAGER) {
      fetchAllAssignments();
    } else {
      // In a real app, we would get the driver ID from authentication
      fetchAssignmentsByDriver('driver-1');
    }
  }, [fetchAllRoutes, fetchAllCombinedRoutes, fetchAllAssignments, fetchAssignmentsByDriver, userRole]);
  
  // Handlers for routes
  const handleEditRoute = (route: FrontendRoute) => {
    setEditingRoute(route);
    setRouteFormOpen(true);
  };
  
  const handleDeleteRoute = (id: string) => {
    setRouteToDelete(id);
    setDeleteRouteDialogOpen(true);
  };
  
  const confirmDeleteRoute = async () => {
    if (routeToDelete) {
      await removeRoute(routeToDelete);
      setDeleteRouteDialogOpen(false);
      setRouteToDelete(null);
    }
  };
  
  // Handlers for combined routes
  const handleEditCombinedRoute = (combinedRoute: FrontendCombinedRoute) => {
    setEditingCombinedRoute(combinedRoute);
    setCombinedRouteFormOpen(true);
  };
  
  const handleDeleteCombinedRoute = (id: string) => {
    setCombinedRouteToDelete(id);
    setDeleteCombinedRouteDialogOpen(true);
  };
  
  const confirmDeleteCombinedRoute = async () => {
    if (combinedRouteToDelete) {
      await removeCombinedRoute(combinedRouteToDelete);
      setDeleteCombinedRouteDialogOpen(false);
      setCombinedRouteToDelete(null);
    }
  };
  
  // Handlers for assignments
  const handleEditAssignment = (assignment: FrontendRouteAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormOpen(true);
  };
  
  const handleDeleteAssignment = (id: string) => {
    setAssignmentToDelete(id);
    setDeleteAssignmentDialogOpen(true);
  };
  
  const confirmDeleteAssignment = async () => {
    if (assignmentToDelete) {
      await removeAssignment(assignmentToDelete);
      setDeleteAssignmentDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };
  
  // Handlers for route execution
  const handleStartExecution = (assignment: FrontendRouteAssignment) => {
    setSelectedAssignment(assignment);
    setExecutionFormMode('start');
    setExecutionFormOpen(true);
  };
  
  const handleUpdateExecution = (assignment: FrontendRouteAssignment, log: FrontendRouteExecutionLog) => {
    setSelectedAssignment(assignment);
    setSelectedExecutionLog(log);
    setExecutionFormMode('update');
    setExecutionFormOpen(true);
  };
  
  // Toggle user role for demonstration
  const toggleUserRole = () => {
    setUserRole(userRole === USER_ROLE.MANAGER ? USER_ROLE.DRIVER : USER_ROLE.MANAGER);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transport Route Management</h2>
        <Button onClick={toggleUserRole} variant="outline">
          Switch to {userRole === USER_ROLE.MANAGER ? 'Driver' : 'Manager'} View
        </Button>
      </div>
      
      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          {userRole === USER_ROLE.MANAGER && (
            <>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="combinedRoutes">Combined Routes</TabsTrigger>
            </>
          )}
          <TabsTrigger value="assignments">
            {userRole === USER_ROLE.MANAGER ? 'Assignments' : 'My Routes'}
          </TabsTrigger>
        </TabsList>
        
        {userRole === USER_ROLE.MANAGER && (
          <>
            <TabsContent value="routes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Individual Routes</h3>
                <Button onClick={() => {
                  setEditingRoute(null);
                  setRouteFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Route
                </Button>
              </div>
              
              {routesLoading ? (
                <p>Loading routes...</p>
              ) : routesError ? (
                <p className="text-destructive">Error loading routes: {routesError}</p>
              ) : routes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <RouteIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No routes found. Create your first route to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Schedules</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {routes.map((route) => (
                          <TableRow key={route.id}>
                            <TableCell className="font-medium">{route.name}</TableCell>
                            <TableCell>{route.description}</TableCell>
                            <TableCell>
                              {route.schedules.map((schedule, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{schedule.day}:</span>{' '}
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditRoute(route)}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteRoute(route.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="combinedRoutes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Combined Routes</h3>
                <Button onClick={() => {
                  setEditingCombinedRoute(null);
                  setCombinedRouteFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Combined Route
                </Button>
              </div>
              
              {combinedRoutesLoading ? (
                <p>Loading combined routes...</p>
              ) : combinedRoutesError ? (
                <p className="text-destructive">Error loading combined routes: {combinedRoutesError}</p>
              ) : combinedRoutes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <RouteIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No combined routes found. Create your first combined route to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Routes</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {combinedRoutes.map((combinedRoute) => (
                          <TableRow key={combinedRoute.id}>
                            <TableCell className="font-medium">{combinedRoute.name}</TableCell>
                            <TableCell>{combinedRoute.description}</TableCell>
                            <TableCell>
                              <Badge variant={combinedRoute.status === 'active' ? 'default' : 'secondary'}>
                                {combinedRoute.status === 'active' ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {combinedRoute.routes.map((route, index) => (
                                <div key={index} className="text-sm">
                                  {index + 1}. {route.routeName}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditCombinedRoute(combinedRoute)}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteCombinedRoute(combinedRoute.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        )}
        
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {userRole === USER_ROLE.MANAGER ? 'Route Assignments' : 'My Assigned Routes'}
            </h3>
            {userRole === USER_ROLE.MANAGER && (
              <Button onClick={() => {
                setEditingAssignment(null);
                setAssignmentFormOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Assign Route
              </Button>
            )}
          </div>
          
          {assignmentsLoading ? (
            <p>Loading assignments...</p>
          ) : assignmentsError ? (
            <p className="text-destructive">Error loading assignments: {assignmentsError}</p>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {userRole === USER_ROLE.MANAGER 
                    ? 'No route assignments found. Assign a route to get started.'
                    : 'You have no assigned routes.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.combinedRouteName}</CardTitle>
                        <CardDescription>
                          Vehicle: {assignment.vehicleInfo} | 
                          Driver: {assignment.driverName}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        assignment.status === 'completed' ? 'success' :
                        assignment.status === 'in_progress' ? 'warning' :
                        assignment.status === 'cancelled' ? 'destructive' :
                        'outline'
                      }>
                        {assignment.status === 'in_progress' ? 'In Progress' :
                         assignment.status === 'scheduled' ? 'Scheduled' :
                         assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {assignment.startDate} 
                          {assignment.endDate ? ` to ${assignment.endDate}` : ''}
                        </span>
                      </div>
                      
                      {assignment.notes && (
                        <div className="text-muted-foreground italic">
                          "{assignment.notes}"
                        </div>
                      )}
                      
                      {assignment.executionLogs && assignment.executionLogs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Execution Logs</h4>
                          <div className="space-y-2">
                            {assignment.executionLogs.map((log) => (
                              <div key={log.id} className="bg-muted p-2 rounded-md">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">{log.executionDate}</div>
                                  <Badge variant={
                                    log.status === 'completed' ? 'success' :
                                    log.status === 'started' ? 'warning' :
                                    log.status === 'delayed' ? 'warning' :
                                    log.status === 'cancelled' ? 'destructive' :
                                    'outline'
                                  }>
                                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="text-sm mt-1">
                                  <span className="text-muted-foreground">Start:</span> {log.startTime}
                                  {log.endTime && (
                                    <> | <span className="text-muted-foreground">End:</span> {log.endTime}</>
                                  )}
                                </div>
                                {log.notes && (
                                  <div className="text-sm mt-1 text-muted-foreground">
                                    {log.notes}
                                  </div>
                                )}
                                {log.status === 'started' && userRole === USER_ROLE.DRIVER && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="mt-2"
                                    onClick={() => handleUpdateExecution(assignment, log)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" /> Update Status
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-end space-x-2">
                    {userRole === USER_ROLE.MANAGER ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </>
                    ) : (
                      assignment.status === 'scheduled' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleStartExecution(assignment)}
                        >
                          <Play className="h-4 w-4 mr-2" /> Start Route
                        </Button>
                      )
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Forms */}
      <RouteForm 
        open={routeFormOpen}
        onOpenChange={setRouteFormOpen}
        onSuccess={fetchAllRoutes}
        editingRoute={editingRoute}
      />
      
      <CombinedRouteForm 
        open={combinedRouteFormOpen}
        onOpenChange={setCombinedRouteFormOpen}
        onSuccess={fetchAllCombinedRoutes}
        editingCombinedRoute={editingCombinedRoute}
      />
      
      <RouteAssignmentForm 
        open={assignmentFormOpen}
        onOpenChange={setAssignmentFormOpen}
        onSuccess={fetchAllAssignments}
        editingAssignment={editingAssignment}
      />
      
      {selectedAssignment && (
        <RouteExecutionForm 
          open={executionFormOpen}
          onOpenChange={setExecutionFormOpen}
          onSuccess={fetchAllAssignments}
          assignment={selectedAssignment}
          executionLog={selectedExecutionLog}
          mode={executionFormMode}
        />
      )}
      
      {/* Confirmation Dialogs */}
      <AlertDialog open={deleteRouteDialogOpen} onOpenChange={setDeleteRouteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this route. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRoute} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deleteCombinedRouteDialogOpen} onOpenChange={setDeleteCombinedRouteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this combined route. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCombinedRoute} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deleteAssignmentDialogOpen} onOpenChange={setDeleteAssignmentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this route assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAssignment} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
