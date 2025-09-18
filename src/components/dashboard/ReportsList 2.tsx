import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ClipboardList, DollarSign, Home, Users } from "lucide-react";
import { recentReports } from "./data";

export function ReportsList() {
  // Function to get the appropriate icon based on report type
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'hr':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'finance':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'operations':
        return <ClipboardList className="h-4 w-4 text-purple-500" />;
      case 'property':
        return <Home className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  {getReportIcon(report.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{report.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.date).toLocaleDateString()} • {report.size}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href={report.downloadUrl} download title={`Download ${report.name}`}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button className="w-full">Generate New Report</Button>
        </div>
      </CardContent>
    </Card>
  );
}
