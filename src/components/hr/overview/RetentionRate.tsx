import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Loader2 } from "lucide-react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

export function RetentionRate() {
  const { stats, statsLoading } = useExternalStaff();
  
  const retentionRate = stats.totalCount > 0 
    ? Math.round((stats.active / stats.totalCount) * 100 * 10) / 10 
    : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Retention Rate
            </p>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-3xl font-bold text-green-600">{retentionRate}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% from last month
                </p>
              </>
            )}
          </div>
          <Users className="h-8 w-8 text-green-600" />
        </div>
      </CardContent>
    </Card>
  );
}
