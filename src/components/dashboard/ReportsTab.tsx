import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ReportsTab() {
  // Mock report data
  const reports = [
    {
      id: "1",
      name: "HR Monthly Report - June 2024",
      category: "HR",
      date: "2024-07-01",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "Financial Statement Q2 2024",
      category: "Finance",
      date: "2024-07-15",
      size: "3.8 MB",
    },
    {
      id: "3",
      name: "Operations Performance - June 2024",
      category: "Operations",
      date: "2024-07-05",
      size: "1.7 MB",
    },
    {
      id: "4",
      name: "Property Occupancy Report - Q2 2024",
      category: "Property",
      date: "2024-07-10",
      size: "5.2 MB",
    },
    {
      id: "5",
      name: "HR Recruitment Analysis - Q2 2024",
      category: "HR",
      date: "2024-07-12",
      size: "1.9 MB",
    },
    {
      id: "6",
      name: "Revenue Forecast - July 2024",
      category: "Finance",
      date: "2024-06-28",
      size: "2.1 MB",
    },
  ];

  // Function to get badge color based on category
  const getBadgeVariant = (category: string) => {
    switch (category) {
      case "HR":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30";
      case "Finance":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30";
      case "Operations":
        return "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30";
      case "Property":
        return "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30";
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="hr">HR</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>View and download all available reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-muted">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{report.name}</p>
                          <Badge variant="outline" className={getBadgeVariant(report.category)}>
                            {report.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.date).toLocaleDateString()} • {report.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hr" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>HR Reports</CardTitle>
              <CardDescription>Human resources related reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter((report) => report.category === "HR")
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-2 bg-blue-500/20">
                          <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.date).toLocaleDateString()} • {report.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finance" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>Finance Reports</CardTitle>
              <CardDescription>Financial statements and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter((report) => report.category === "Finance")
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-2 bg-green-500/20">
                          <FileText className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.date).toLocaleDateString()} • {report.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operations" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>Operations Reports</CardTitle>
              <CardDescription>Field operations and job order reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter((report) => report.category === "Operations")
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-2 bg-purple-500/20">
                          <FileText className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.date).toLocaleDateString()} • {report.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button>Generate New Report</Button>
      </div>
    </div>
  );
}
