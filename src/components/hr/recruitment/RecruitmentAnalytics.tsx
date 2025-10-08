import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useRecruitmentAnalytics } from "@/hooks/recruitment/useRecruitmentAnalytics";

interface RecruitmentAnalyticsProps {
  timeRange: string;
  department: string;
}

export function RecruitmentAnalytics({ timeRange, department }: RecruitmentAnalyticsProps) {
  const [chartType, setChartType] = useState("monthly");
  const { metrics, loading } = useRecruitmentAnalytics(timeRange, department);
  
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recruitment Analytics</h2>
          <p className="text-muted-foreground">Insights and trends for {department === "all" ? "all departments" : department}</p>
        </div>
        <div className="flex gap-2">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{loading ? "..." : `${metrics.avgTimeToHire} days`}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -{Math.floor(metrics.avgTimeToHire * 0.12)} days from last {chartType}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Cost per Hire</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{loading ? "..." : `$${metrics.costPerHire.toLocaleString()}`}</div>
            <p className="text-xs text-red-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +$250 from last {chartType}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Offer Acceptance</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{loading ? "..." : `${metrics.offerAcceptanceRate}%`}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3% from last {chartType}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Qualified Candidates</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{loading ? "..." : `${metrics.qualifiedCandidateRate}%`}</div>
            <p className="text-xs text-red-500 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2% from last {chartType}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Time to Hire Trends</CardTitle>
                <CardDescription>Average days to fill positions over time</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Line chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 relative">
                  {/* X-axis months */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                    {chartType === "monthly" ? (
                      <>
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                      </>
                    ) : chartType === "quarterly" ? (
                      <>
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4</span>
                      </>
                    ) : (
                      <>
                        <span>2022</span>
                        <span>2023</span>
                        <span>2024</span>
                        <span>2025</span>
                      </>
                    )}
                  </div>
                  
                  {/* Line chart path - simplified representation */}
                  <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                    <path 
                      d="M 0,150 L 50,130 L 100,120 L 150,140 L 200,100 L 250,80" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="150" r="3" fill="#3b82f6" />
                    <circle cx="50" cy="130" r="3" fill="#3b82f6" />
                    <circle cx="100" cy="120" r="3" fill="#3b82f6" />
                    <circle cx="150" cy="140" r="3" fill="#3b82f6" />
                    <circle cx="200" cy="100" r="3" fill="#3b82f6" />
                    <circle cx="250" cy="80" r="3" fill="#3b82f6" />
                    
                    {/* Department comparison line */}
                    <path 
                      d="M 0,170 L 50,160 L 100,140 L 150,130 L 200,120 L 250,110" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                    <circle cx="0" cy="170" r="3" fill="#10b981" />
                    <circle cx="50" cy="160" r="3" fill="#10b981" />
                    <circle cx="100" cy="140" r="3" fill="#10b981" />
                    <circle cx="150" cy="130" r="3" fill="#10b981" />
                    <circle cx="200" cy="120" r="3" fill="#10b981" />
                    <circle cx="250" cy="110" r="3" fill="#10b981" />
                  </svg>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Current Period</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Previous Period</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Application Sources</CardTitle>
                <CardDescription>Where candidates are coming from</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Bar chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '180px' }}></div>
                    <span className="text-xs mt-1">Job Boards</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '120px' }}></div>
                    <span className="text-xs mt-1">LinkedIn</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '150px' }}></div>
                    <span className="text-xs mt-1">Referrals</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '80px' }}></div>
                    <span className="text-xs mt-1">Career Page</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '60px' }}></div>
                    <span className="text-xs mt-1">Agencies</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '40px' }}></div>
                    <span className="text-xs mt-1">Other</span>
                  </div>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex-1">Application Sources</div>
                  <div className="flex items-center">
                    <span>Number of Applications</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recruitment Funnel Conversion</CardTitle>
                <CardDescription>Conversion rates between stages</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Funnel chart visualization */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full max-w-md space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Applications</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-blue-500 h-8 rounded-sm"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Screened</span>
                      <span>65%</span>
                    </div>
                    <div className="w-[65%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Assessment</span>
                      <span>42%</span>
                    </div>
                    <div className="w-[42%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Interview</span>
                      <span>28%</span>
                    </div>
                    <div className="w-[28%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Offer</span>
                      <span>12%</span>
                    </div>
                    <div className="w-[12%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Hired</span>
                      <span>8%</span>
                    </div>
                    <div className="w-[8%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Recruitment costs breakdown</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Donut chart visualization */}
              <div className="flex items-center justify-center h-full">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Segment 1 - 40% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray="251.2 452.4"
                      strokeDashoffset="0"
                    />
                    {/* Segment 2 - 25% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray="157.1 452.4"
                      strokeDashoffset="-251.2"
                    />
                    {/* Segment 3 - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray="125.6 452.4"
                      strokeDashoffset="-408.3"
                    />
                    {/* Segment 4 - 15% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8b5cf6"
                      strokeWidth="20"
                      strokeDasharray="94.2 452.4"
                      strokeDashoffset="-533.9"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="var(--background)"
                    />
                  </svg>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs">Job Advertising (40%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs">Agency Fees (25%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-xs">Assessment Tools (20%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs">Other Costs (15%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Benchmarking Section */}
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Industry Benchmarking</CardTitle>
              <CardDescription>How your metrics compare to industry standards</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View Details <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Time to Hire</div>
                  <div className="text-xs text-muted-foreground">Days from job posting to acceptance</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{loading ? "..." : `${metrics.avgTimeToHire} days`}</span>
                  <span className="text-muted-foreground ml-2">(Industry: 45 days)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.avgTimeToHire <= 45 ? 'bg-green-500' : 'bg-amber-500'}`} 
                  style={{ width: `${Math.min(100, (45 / Math.max(metrics.avgTimeToHire, 45)) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Cost per Hire</div>
                  <div className="text-xs text-muted-foreground">Average cost to fill a position</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{loading ? "..." : `$${metrics.costPerHire.toLocaleString()}`}</span>
                  <span className="text-muted-foreground ml-2">(Industry: $4,000)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.costPerHire <= 4000 ? 'bg-green-500' : 'bg-amber-500'}`} 
                  style={{ width: `${Math.min(100, (4000 / Math.max(metrics.costPerHire, 4000)) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Offer Acceptance Rate</div>
                  <div className="text-xs text-muted-foreground">Percentage of offers accepted</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{loading ? "..." : `${metrics.offerAcceptanceRate}%`}</span>
                  <span className="text-muted-foreground ml-2">(Industry: 76%)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.offerAcceptanceRate >= 76 ? 'bg-green-500' : 'bg-amber-500'}`} 
                  style={{ width: `${Math.min(100, metrics.offerAcceptanceRate)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Qualified Candidate Rate</div>
                  <div className="text-xs text-muted-foreground">Percentage of qualified candidates</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{loading ? "..." : `${metrics.qualifiedCandidateRate}%`}</span>
                  <span className="text-muted-foreground ml-2">(Industry: 35%)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.qualifiedCandidateRate >= 35 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, metrics.qualifiedCandidateRate)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
