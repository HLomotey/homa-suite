import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RevenueProfitTrend() {
  const navigate = useNavigate();
  
  // Mock data based on dashboard insights
  const monthlyData = [
    { month: "Jan", revenue: 450000, profit: 387000, expenses: 63000 },
    { month: "Feb", revenue: 520000, profit: 455000, expenses: 65000 },
    { month: "Mar", revenue: 485000, profit: 425000, expenses: 60000 },
    { month: "Apr", revenue: 620000, profit: 543000, expenses: 77000 },
    { month: "May", revenue: 775000, profit: 678000, expenses: 97000 },
    { month: "Jun", revenue: 850000, profit: 744000, expenses: 106000 }
  ];

  const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
  const totalProfit = monthlyData.reduce((sum, month) => sum + month.profit, 0);
  const profitMargin = (totalProfit / totalRevenue) * 100;
  const revenueGrowth = ((monthlyData[5].revenue - monthlyData[0].revenue) / monthlyData[0].revenue) * 100;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const maxValue = Math.max(...monthlyData.map(d => d.revenue));
  
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{formatCurrency(totalProfit)}</div>
          <div className="text-xs text-muted-foreground">Total Profit</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-semibold text-foreground">{profitMargin.toFixed(1)}%</span>
            <TrendingUp className="h-3 w-3 text-green-500" />
          </div>
          <div className="text-xs text-muted-foreground">Profit Margin</div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="h-[200px] w-full bg-background border border-border rounded-lg p-4">
        <div className="h-full w-full relative">
          {/* Revenue and Profit Bars */}
          <div className="flex items-end justify-between h-full gap-2">
            {monthlyData.map((data, index) => {
              const revenueHeight = (data.revenue / maxValue) * 100;
              const profitHeight = (data.profit / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative w-full h-full flex items-end justify-center gap-1">
                    {/* Revenue Bar */}
                    <div 
                      className={`bg-blue-500/70 w-3 rounded-t-sm transition-all duration-300`}
                      style={{ 
                        '--revenue-height': `${revenueHeight}%`,
                        height: 'var(--revenue-height)'
                      } as React.CSSProperties}
                      title={`Revenue: ${formatCurrency(data.revenue)}`}
                    ></div>
                    {/* Profit Bar */}
                    <div 
                      className={`bg-green-500/70 w-3 rounded-t-sm transition-all duration-300`}
                      style={{ 
                        '--profit-height': `${profitHeight}%`,
                        height: 'var(--profit-height)'
                      } as React.CSSProperties}
                      title={`Profit: ${formatCurrency(data.profit)}`}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{data.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend and Insights */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/70 rounded"></div>
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/70 rounded"></div>
            <span className="text-xs text-muted-foreground">Profit</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            +{revenueGrowth.toFixed(1)}% Growth
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => navigate('/finance/revenue-trend')}
          >
            Details <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Key Insights</span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Revenue growth accelerated in Q2 with {revenueGrowth.toFixed(1)}% increase</p>
          <p>• Profit margin maintained at {profitMargin.toFixed(1)}% across all months</p>
          <p>• May showed strongest performance with {formatCurrency(monthlyData[4].revenue)} revenue</p>
        </div>
      </div>
    </div>
  );
}
