import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";

export function HROverview() {
  const [timeRange, setTimeRange] = useState("6m");
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Headcount by Department</CardTitle>
                <CardDescription>Employee distribution across departments</CardDescription>
              </div>
              <Tabs 
                value={timeRange} 
                onValueChange={setTimeRange} 
                className="w-[200px]"
              >
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="3m">3M</TabsTrigger>
                  <TabsTrigger value="6m">6M</TabsTrigger>
                  <TabsTrigger value="1y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Bar chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '250px' }}></div>
                    <span className="text-xs mt-1">Engineering</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '150px' }}></div>
                    <span className="text-xs mt-1">Sales</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '80px' }}></div>
                    <span className="text-xs mt-1">Marketing</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '50px' }}></div>
                    <span className="text-xs mt-1">HR</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '70px' }}></div>
                    <span className="text-xs mt-1">Finance</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '180px' }}></div>
                    <span className="text-xs mt-1">Operations</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '120px' }}></div>
                    <span className="text-xs mt-1">Support</span>
                  </div>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex-1">Departments</div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    View Details <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee Retention Rate</CardTitle>
                <CardDescription>Monthly retention rate trends</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8">
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
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                  
                  {/* Y-axis percentages */}
                  <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                    <span>100%</span>
                    <span>95%</span>
                    <span>90%</span>
                    <span>85%</span>
                    <span>80%</span>
                  </div>
                  
                  {/* Line chart path - simplified representation */}
                  <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                    <path 
                      d="M 0,50 L 50,30 L 100,45 L 150,20 L 200,35 L 250,30" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="50" r="3" fill="#10b981" />
                    <circle cx="50" cy="30" r="3" fill="#10b981" />
                    <circle cx="100" cy="45" r="3" fill="#10b981" />
                    <circle cx="150" cy="20" r="3" fill="#10b981" />
                    <circle cx="200" cy="35" r="3" fill="#10b981" />
                    <circle cx="250" cy="30" r="3" fill="#10b981" />
                  </svg>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Retention Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Employee gender breakdown</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {/* Pie chart visualization */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Male segment - 55% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray="251.2 452.4"
                    strokeDashoffset="0"
                  />
                  {/* Female segment - 45% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth="40"
                    strokeDasharray="201.1 452.4"
                    strokeDashoffset="-251.2"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs">
                  <div className="text-center">
                    <div className="font-medium">Gender Ratio</div>
                    <div className="text-muted-foreground">55% / 45%</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Male (55%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                  <span className="text-sm">Female (45%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-4 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hiring Trends</CardTitle>
                <CardDescription>Monthly hires and time to hire</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Bar chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6 justify-around">
                  {/* Jan */}
                  <div className="flex flex-col items-center space-x-1">
                    <div className="flex items-end space-x-1">
                      <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '120px' }}></div>
                      <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '180px' }}></div>
                    </div>
                    <span className="text-xs mt-1">Jan</span>
                  </div>
                  
                  {/* Feb */}
                  <div className="flex flex-col items-center space-x-1">
                    <div className="flex items-end space-x-1">
                      <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '100px' }}></div>
                      <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '150px' }}></div>
                    </div>
                    <span className="text-xs mt-1">Feb</span>
                  </div>
                  
                  {/* Mar */}
                  <div className="flex flex-col items-center space-x-1">
                    <div className="flex items-end space-x-1">
                      <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '150px' }}></div>
                      <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '200px' }}></div>
                    </div>
                    <span className="text-xs mt-1">Mar</span>
                  </div>
                  
                  {/* Apr */}
                  <div className="flex flex-col items-center space-x-1">
                    <div className="flex items-end space-x-1">
                      <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '130px' }}></div>
                      <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '170px' }}></div>
                    </div>
                    <span className="text-xs mt-1">Apr</span>
                  </div>
                  
                  {/* May */}
                  <div className="flex flex-col items-center space-x-1">
                    <div className="flex items-end space-x-1">
                      <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '180px' }}></div>
                      <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '220px' }}></div>
                    </div>
                    <span className="text-xs mt-1">May</span>
                  </div>
                  
                  {/* Jun */}
                  <div className="flex flex-col items-center space-x-1">
                    <div className="flex items-end space-x-1">
                      <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '160px' }}></div>
                      <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '190px' }}></div>
                    </div>
                    <span className="text-xs mt-1">Jun</span>
                  </div>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                    <span>Time to Hire</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                    <span>New Hires</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
