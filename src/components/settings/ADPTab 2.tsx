"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ADPService } from "./data";

export function ADPTab() {
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<null | { success: boolean; message: string }>(null);
  const [activeTab, setActiveTab] = useState("workers");
  const [data, setData] = useState<any>(null);

  // Create ADP service instance
  const createADPService = () => {
    if (!clientId || !clientSecret) {
      toast({
        title: "Missing credentials",
        description: "Please enter your ADP client ID and client secret",
        variant: "destructive",
      });
      return null;
    }
    
    return new ADPService({ clientId, clientSecret }, "Workforce Now");
  };

  // Test connection to ADP API
  const testConnection = async () => {
    setLoading({ ...loading, connection: true });
    try {
      const adpService = createADPService();
      if (!adpService) return;
      
      const result = await adpService.testConnection();
      setConnectionStatus(result);
      
      toast({
        title: result.success ? "Connection successful" : "Connection failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      toast({
        title: "Connection failed",
        description: "An error occurred while testing the connection",
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, connection: false });
    }
  };

  // Fetch workers data
  const fetchWorkers = async () => {
    setLoading({ ...loading, workers: true });
    try {
      const adpService = createADPService();
      if (!adpService) return;
      
      const result = await adpService.getWorkers();
      setData(result);
      
      toast({
        title: "Workers data fetched",
        description: `Successfully retrieved data for ${result.workers?.length || 0} workers`,
      });
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast({
        title: "Failed to fetch workers",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, workers: false });
    }
  };

  // Fetch payroll data
  const fetchPayroll = async () => {
    setLoading({ ...loading, payroll: true });
    try {
      const adpService = createADPService();
      if (!adpService) return;
      
      const result = await adpService.getPayrollData();
      setData(result);
      
      toast({
        title: "Payroll data fetched",
        description: "Successfully retrieved payroll data",
      });
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast({
        title: "Failed to fetch payroll data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, payroll: false });
    }
  };

  // Fetch time and attendance data
  const fetchTimeAndAttendance = async () => {
    setLoading({ ...loading, timeAttendance: true });
    try {
      const adpService = createADPService();
      if (!adpService) return;
      
      // Get data for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const result = await adpService.getTimeAndAttendance(startDate, endDate);
      setData(result);
      
      toast({
        title: "Time and attendance data fetched",
        description: "Successfully retrieved time and attendance data",
      });
    } catch (error) {
      console.error("Error fetching time and attendance data:", error);
      toast({
        title: "Failed to fetch time and attendance data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, timeAttendance: false });
    }
  };

  // Fetch benefits data
  const fetchBenefits = async () => {
    setLoading({ ...loading, benefits: true });
    try {
      const adpService = createADPService();
      if (!adpService) return;
      
      const result = await adpService.getBenefitsData();
      setData(result);
      
      toast({
        title: "Benefits data fetched",
        description: "Successfully retrieved benefits data",
      });
    } catch (error) {
      console.error("Error fetching benefits data:", error);
      toast({
        title: "Failed to fetch benefits data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, benefits: false });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">ADP API Credentials</CardTitle>
          <CardDescription className="text-white/60">
            Enter your ADP API credentials to test the connection and fetch data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-white">Client ID</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your ADP client ID"
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret" className="text-white">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter your ADP client secret"
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={testConnection} 
            disabled={loading.connection || !clientId || !clientSecret}
          >
            {loading.connection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          {connectionStatus && (
            <div className="ml-4 flex items-center">
              {connectionStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={connectionStatus.success ? "text-green-500" : "text-red-500"}>
                {connectionStatus.message}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 bg-black/40 border border-white/10">
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="timeAttendance">Time & Attendance</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workers" className="mt-4">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Workers Data</CardTitle>
              <CardDescription className="text-white/60">
                Fetch employee information from ADP Workforce Now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fetchWorkers} 
                disabled={loading.workers || !connectionStatus?.success}
              >
                {loading.workers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Workers Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll" className="mt-4">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Payroll Data</CardTitle>
              <CardDescription className="text-white/60">
                Fetch payroll information from ADP Workforce Now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fetchPayroll} 
                disabled={loading.payroll || !connectionStatus?.success}
              >
                {loading.payroll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Payroll Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeAttendance" className="mt-4">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Time & Attendance Data</CardTitle>
              <CardDescription className="text-white/60">
                Fetch time and attendance data from ADP Workforce Now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fetchTimeAndAttendance} 
                disabled={loading.timeAttendance || !connectionStatus?.success}
              >
                {loading.timeAttendance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Time & Attendance Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="benefits" className="mt-4">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Benefits Data</CardTitle>
              <CardDescription className="text-white/60">
                Fetch benefits information from ADP Workforce Now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fetchBenefits} 
                disabled={loading.benefits || !connectionStatus?.success}
              >
                {loading.benefits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Benefits Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {data && (
        <Card className="bg-black/40 backdrop-blur-md border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white">API Response</CardTitle>
            <CardDescription className="text-white/60">
              Data retrieved from ADP API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-black/60 p-4 rounded-md overflow-auto max-h-96 text-white/80">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/40 backdrop-blur-md border-white/10 mt-6">
        <CardHeader>
          <CardTitle className="text-white">How to Get ADP API Credentials</CardTitle>
          <CardDescription className="text-white/60">
            Follow these steps to obtain your ADP API credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-white/80">
            <div className="flex items-start gap-2">
              <div className="bg-blue-900/40 rounded-full p-1 mt-0.5">
                <span className="text-xs font-bold text-blue-300">1</span>
              </div>
              <p>Register for an ADP developer account at <a href="https://developers.adp.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://developers.adp.com</a></p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-900/40 rounded-full p-1 mt-0.5">
                <span className="text-xs font-bold text-blue-300">2</span>
              </div>
              <p>Create a new application in the ADP Developer Portal</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-900/40 rounded-full p-1 mt-0.5">
                <span className="text-xs font-bold text-blue-300">3</span>
              </div>
              <p>Select the APIs you need access to (HR, Payroll, Time & Attendance, Benefits)</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-900/40 rounded-full p-1 mt-0.5">
                <span className="text-xs font-bold text-blue-300">4</span>
              </div>
              <p>Once your application is approved, you'll receive your Client ID and Client Secret</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-900/40 rounded-full p-1 mt-0.5">
                <span className="text-xs font-bold text-blue-300">5</span>
              </div>
              <p>Enter these credentials above to test the connection and fetch data</p>
            </div>
            
            <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/30 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-300">Important Note</p>
                  <p className="text-sm text-amber-200/80">
                    To access real ADP data, you need to be an ADP customer with proper authorization. 
                    For development and testing purposes, you can use ADP's sandbox environment, which provides 
                    test data that mimics real production data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
