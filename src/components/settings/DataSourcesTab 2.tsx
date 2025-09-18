"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, FileSpreadsheet, BarChart3, Download, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataSource, Connection, mockDataSources, mockConnections } from "./data";

export function DataSourcesTab() {
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [newDataSource, setNewDataSource] = useState({
    name: "",
    type: "REST API Endpoint",
    connectionId: "",
    endpoint: "",
  });

  const handleAddDataSource = () => {
    if (!newDataSource.name || !newDataSource.connectionId || !newDataSource.endpoint) {
      toast({
        title: "Missing Information",
        description: "Please provide all required information for the data source.",
        variant: "destructive",
      });
      return;
    }

    const connectionName = mockConnections.find(c => c.id === newDataSource.connectionId)?.name || "Unknown";
    
    const dataSource: DataSource = {
      id: `${dataSources.length + 1}`,
      name: newDataSource.name,
      type: newDataSource.type,
      connectionId: newDataSource.connectionId,
      connectionName,
      lastUpdated: new Date().toISOString(),
      recordCount: 0,
      status: "available",
    };

    setDataSources([...dataSources, dataSource]);
    setNewDataSource({ name: "", type: "REST API Endpoint", connectionId: "", endpoint: "" });
    
    toast({
      title: "Data Source Added",
      description: "The new data source has been added successfully.",
    });
  };

  const syncDataSource = (id: string) => {
    // In a real app, this would trigger a data sync with the external API
    toast({
      title: "Syncing Data Source",
      description: "Starting data synchronization process...",
    });
    
    setSyncingSource(id);
    setSyncProgress(0);
    
    // Simulate sync progress with intervals
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncingSource(null);
          
          // Update the data source with new information
          setDataSources(
            dataSources.map((source) => {
              if (source.id === id) {
                return { 
                  ...source, 
                  lastUpdated: new Date().toISOString(),
                  recordCount: source.recordCount + Math.floor(Math.random() * 100),
                  status: "available"
                };
              }
              return source;
            })
          );
          
          toast({
            title: "Sync Complete",
            description: "Data source has been synchronized successfully.",
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  const deleteDataSource = (id: string) => {
    setDataSources(dataSources.filter(source => source.id !== id));
    toast({
      title: "Data Source Deleted",
      description: "The data source has been removed successfully.",
    });
  };

  const downloadData = (id: string) => {
    // In a real app, this would generate and download a file with the data
    toast({
      title: "Preparing Download",
      description: "Generating data export file...",
    });
    
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: "Your data export is ready for download.",
      });
    }, 1500);
  };

  const getStatusBadge = (status: DataSource["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "syncing":
        return <Badge variant="secondary">Syncing</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="mb-4 bg-black/40 border border-white/10">
          <TabsTrigger value="existing">Existing Data Sources</TabsTrigger>
          <TabsTrigger value="new">Add New Data Source</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Available Data Sources</CardTitle>
              <CardDescription className="text-white/60">
                Data sources connected to external systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-black/60">
                  <TableRow>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Connection</TableHead>
                    <TableHead className="text-white">Last Updated</TableHead>
                    <TableHead className="text-white">Records</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id} className="bg-black/20 hover:bg-black/40 border-b border-white/5">
                      <TableCell className="font-medium text-white">{source.name}</TableCell>
                      <TableCell className="text-white/80">{source.type}</TableCell>
                      <TableCell className="text-white/80">{source.connectionName}</TableCell>
                      <TableCell className="text-white/80">{formatDate(source.lastUpdated)}</TableCell>
                      <TableCell className="text-white/80">{source.recordCount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => syncDataSource(source.id)}
                            disabled={syncingSource === source.id}
                            className="bg-black/40 border-white/10 text-white hover:bg-white/10"
                          >
                            {syncingSource === source.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                <Progress value={syncProgress} className="w-8 h-2" />
                              </>
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadData(source.id)}
                            disabled={source.status !== "available" || source.recordCount === 0}
                            className="bg-black/40 border-white/10 text-white hover:bg-white/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-black/40 border-white/10 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-black/90 border-white/10 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
                                <DialogDescription className="text-white/60">
                                  Are you sure you want to delete the "{source.name}" data source? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" className="bg-black/40 border-white/10 text-white hover:bg-white/10">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => deleteDataSource(source.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Add New Data Source</CardTitle>
              <CardDescription className="text-white/60">
                Configure a new data source from an existing API connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-white">Data Source Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Customer Data" 
                    value={newDataSource.name}
                    onChange={(e) => setNewDataSource({...newDataSource, name: e.target.value})}
                    className="bg-black/40 border-white/10 text-white"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-white">Data Source Type</Label>
                  <Select 
                    value={newDataSource.type}
                    onValueChange={(value) => setNewDataSource({...newDataSource, type: value})}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white">
                      <SelectValue placeholder="Select Data Source Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      <SelectItem value="REST API Endpoint">REST API Endpoint</SelectItem>
                      <SelectItem value="GraphQL Query">GraphQL Query</SelectItem>
                      <SelectItem value="Database Table">Database Table</SelectItem>
                      <SelectItem value="CSV File">CSV File</SelectItem>
                      <SelectItem value="JSON Feed">JSON Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="connection" className="text-white">API Connection</Label>
                  <Select 
                    value={newDataSource.connectionId}
                    onValueChange={(value) => setNewDataSource({...newDataSource, connectionId: value})}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white">
                      <SelectValue placeholder="Select API Connection" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      {mockConnections.map(connection => (
                        <SelectItem key={connection.id} value={connection.id}>
                          {connection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="endpoint" className="text-white">Endpoint / Resource Path</Label>
                  <Input 
                    id="endpoint" 
                    placeholder="/api/customers or table_name" 
                    value={newDataSource.endpoint}
                    onChange={(e) => setNewDataSource({...newDataSource, endpoint: e.target.value})}
                    className="bg-black/40 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddDataSource}>Add Data Source</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
