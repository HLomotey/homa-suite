import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function DiversityTrends() {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diversity Trends</CardTitle>
            <CardDescription>Year-over-year diversity metrics</CardDescription>
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
              {/* X-axis years */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                <span>2019</span>
                <span>2020</span>
                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
                <span>2024</span>
              </div>
              
              {/* Y-axis percentages */}
              <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                <span>50%</span>
                <span>40%</span>
                <span>30%</span>
                <span>20%</span>
                <span>10%</span>
                <span>0%</span>
              </div>
              
              {/* Line chart paths - simplified representation */}
              <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                {/* Gender diversity line */}
                <path 
                  d="M 0,150 L 50,140 L 100,120 L 150,110 L 200,100 L 250,90" 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="2"
                />
                <circle cx="0" cy="150" r="3" fill="#ec4899" />
                <circle cx="50" cy="140" r="3" fill="#ec4899" />
                <circle cx="100" cy="120" r="3" fill="#ec4899" />
                <circle cx="150" cy="110" r="3" fill="#ec4899" />
                <circle cx="200" cy="100" r="3" fill="#ec4899" />
                <circle cx="250" cy="90" r="3" fill="#ec4899" />
                
                {/* Ethnic diversity line */}
                <path 
                  d="M 0,170 L 50,160 L 100,150 L 150,130 L 200,120 L 250,110" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="2"
                />
                <circle cx="0" cy="170" r="3" fill="#8b5cf6" />
                <circle cx="50" cy="160" r="3" fill="#8b5cf6" />
                <circle cx="100" cy="150" r="3" fill="#8b5cf6" />
                <circle cx="150" cy="130" r="3" fill="#8b5cf6" />
                <circle cx="200" cy="120" r="3" fill="#8b5cf6" />
                <circle cx="250" cy="110" r="3" fill="#8b5cf6" />
              </svg>
            </div>
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-pink-500 mr-1"></div>
                <span>Gender Diversity</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                <span>Ethnic Diversity</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
