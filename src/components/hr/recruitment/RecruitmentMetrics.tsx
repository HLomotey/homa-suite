import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface RecruitmentMetricsProps {
  timeRange: string;
  department: string;
}

export function RecruitmentMetrics({ timeRange, department }: RecruitmentMetricsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Time to Hire by Department</CardTitle>
                <CardDescription>Average days to fill positions</CardDescription>
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
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '200px' }}></div>
                    <span className="text-xs mt-1">Engineering</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '120px' }}></div>
                    <span className="text-xs mt-1">Sales</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '150px' }}></div>
                    <span className="text-xs mt-1">Marketing</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '100px' }}></div>
                    <span className="text-xs mt-1">HR</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '180px' }}></div>
                    <span className="text-xs mt-1">Finance</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '160px' }}></div>
                    <span className="text-xs mt-1">Operations</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '130px' }}></div>
                    <span className="text-xs mt-1">Support</span>
                  </div>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex-1">Departments</div>
                  <div className="flex items-center">
                    <span>Days to Hire</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Source of Hire</CardTitle>
                <CardDescription>Where successful candidates come from</CardDescription>
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
                    {/* Segment 1 - 35% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray="219.8 452.4"
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
                      strokeDashoffset="-219.8"
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
                      strokeDashoffset="-376.9"
                    />
                    {/* Segment 4 - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8b5cf6"
                      strokeWidth="20"
                      strokeDasharray="125.6 452.4"
                      strokeDashoffset="-502.5"
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
                    <span className="text-xs">Job Boards (35%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs">Referrals (25%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-xs">LinkedIn (20%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs">Other (20%)</span>
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
                <CardTitle>Hiring Velocity</CardTitle>
                <CardDescription>Monthly hiring trends</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {/* Line chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 relative">
                  {/* X-axis months */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                  
                  {/* Line chart path - simplified representation */}
                  <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                    <path 
                      d="M 0,150 L 50,120 L 100,180 L 150,100 L 200,140 L 250,80" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="150" r="3" fill="#3b82f6" />
                    <circle cx="50" cy="120" r="3" fill="#3b82f6" />
                    <circle cx="100" cy="180" r="3" fill="#3b82f6" />
                    <circle cx="150" cy="100" r="3" fill="#3b82f6" />
                    <circle cx="200" cy="140" r="3" fill="#3b82f6" />
                    <circle cx="250" cy="80" r="3" fill="#3b82f6" />
                  </svg>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>New Hires</span>
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
                <CardTitle>Recruitment Funnel</CardTitle>
                <CardDescription>Conversion rates between stages</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {/* Funnel visualization */}
              <div className="w-full max-w-md space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Applications</span>
                    <span>428</span>
                  </div>
                  <div className="w-full bg-blue-500 h-8 rounded-sm"></div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Screened</span>
                    <span>214 (50%)</span>
                  </div>
                  <div className="w-[75%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Interviewed</span>
                    <span>92 (21.5%)</span>
                  </div>
                  <div className="w-[50%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Offers</span>
                    <span>18 (4.2%)</span>
                  </div>
                  <div className="w-[25%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Hired</span>
                    <span>15 (3.5%)</span>
                  </div>
                  <div className="w-[15%] mx-auto bg-blue-500 h-8 rounded-sm"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
