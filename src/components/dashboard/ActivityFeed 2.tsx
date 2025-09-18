import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, DollarSign, Home, Users } from "lucide-react";
import { recentActivities } from "./data";

export function ActivityFeed() {
  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (type: string) => {
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
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-muted">
                {getActivityIcon(activity.type)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {activity.timestamp}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View all activities</Button>
      </CardFooter>
    </Card>
  );
}
