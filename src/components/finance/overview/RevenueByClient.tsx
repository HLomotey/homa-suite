import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RevenueByClient() {
  const navigate = useNavigate();
  
  // Mock data based on dashboard insights
  const clientData = [
    { client: "TechCorp Solutions", revenue: 485000, percentage: 17.0, color: "bg-blue-500" },
    { client: "Global Industries", revenue: 342000, percentage: 12.0, color: "bg-green-500" },
    { client: "Innovation Labs", revenue: 285000, percentage: 10.0, color: "bg-purple-500" },
    { client: "Digital Dynamics", revenue: 228000, percentage: 8.0, color: "bg-orange-500" },
    { client: "Future Systems", revenue: 171000, percentage: 6.0, color: "bg-yellow-500" },
    { client: "Others", revenue: 1339000, percentage: 47.0, color: "bg-gray-400" }
  ];

  const totalRevenue = clientData.reduce((sum, client) => sum + client.revenue, 0);
  const topTwoConcentration = clientData[0].percentage + clientData[1].percentage;
  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-4">
      {/* Client Revenue List */}
      <div className="space-y-3">
        {clientData.slice(0, 5).map((client, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 ${client.color} rounded-full`}></div>
              <div>
                <div className="font-medium text-sm text-foreground">{client.client}</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(client.revenue)} revenue</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm text-foreground">{client.percentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">of total</div>
            </div>
          </div>
        ))}
      </div>

      {/* Concentration Risk Analysis */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Concentration Risk</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-700 dark:text-orange-300">Top 2 clients</span>
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              {topTwoConcentration.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            High dependency on top clients. Consider diversification strategies.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{clientData.length - 1}</div>
          <div className="text-xs text-muted-foreground">Active Clients</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-semibold text-foreground">{formatCurrency(totalRevenue / (clientData.length - 1))}</span>
            <TrendingUp className="h-3 w-3 text-green-500" />
          </div>
          <div className="text-xs text-muted-foreground">Avg per Client</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Client Portfolio</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs"
          onClick={() => navigate('/finance/client-revenue')}
        >
          View All Clients <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Strategic Insights */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Growth Opportunities</span>
        </div>
        <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
          <p>• Focus on expanding mid-tier clients (8-12% range)</p>
          <p>• Develop new client acquisition strategies</p>
          <p>• Consider upselling to existing smaller clients</p>
        </div>
      </div>
    </div>
  );
}
