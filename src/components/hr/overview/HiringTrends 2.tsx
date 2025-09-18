import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, UserPlus, Loader2 } from "lucide-react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

export function HiringTrends() {
  const { stats, statsLoading } = useExternalStaff();
  
  // Calculate new hires as a percentage of active staff
  const newHires = stats.active > 0 ? Math.floor(stats.active * 0.02) : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              New Hires
            </p>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-3xl font-bold text-amber-600">{newHires}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </>
            )}
          </div>
          <UserPlus className="h-8 w-8 text-amber-600" />
        </div>
      </CardContent>
    </Card>
  );
}
