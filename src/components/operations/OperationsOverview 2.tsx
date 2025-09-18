import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TotalJobOrders } from "./overview/TotalJobOrders";
import { FillRate } from "./overview/FillRate";
import { TimeToFill } from "./overview/TimeToFill";
import { PlacementRate } from "./overview/PlacementRate";
import { JobOrdersTrend } from "./overview/JobOrdersTrend";
import { RegionalFillRate } from "./overview/RegionalFillRate";
import { TimeToFillTrend } from "./overview/TimeToFillTrend";
import { JobTypesDistribution } from "./overview/JobTypesDistribution";

export function OperationsOverview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TotalJobOrders />
        <FillRate />
        <TimeToFill />
        <PlacementRate />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Job Orders Trend</h3>
                <p className="text-sm text-muted-foreground">
                  Monthly job orders: total, filled, and pending
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/operations/job-orders-trend")}
              >
                View Details
              </Button>
            </div>
            <JobOrdersTrend />
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Fill Rate by Region</h3>
                <p className="text-sm text-muted-foreground">
                  Regional performance comparison
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/operations/regional-performance")}
              >
                View Details
              </Button>
            </div>
            <RegionalFillRate />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Time to Fill Trend</h3>
                <p className="text-sm text-muted-foreground">
                  Average days to fill vs target
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/operations/time-to-fill")}
              >
                View Details
              </Button>
            </div>
            <TimeToFillTrend />
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Job Types Distribution
                </h3>
                <p className="text-sm text-muted-foreground">
                  Breakdown by employment type
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/operations/job-types")}
              >
                View Details
              </Button>
            </div>
            <JobTypesDistribution />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
