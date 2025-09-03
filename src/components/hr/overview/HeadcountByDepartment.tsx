import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, Loader2 } from "lucide-react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

export function HeadcountByDepartment() {
  const { stats, statsLoading } = useExternalStaff();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Headcount
            </p>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCount.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% from last month
                </p>
              </>
            )}
          </div>
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
}
