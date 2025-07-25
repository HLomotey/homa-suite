import { HeadcountByDepartment } from "./HeadcountByDepartment";
import { RetentionRate } from "./RetentionRate";
import { GenderOverview } from "./GenderOverview";
import { HiringTrends } from "./HiringTrends";

export function HROverview() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <HeadcountByDepartment />
        <RetentionRate />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <GenderOverview />
        <HiringTrends />
      </div>
    </div>
  );
}

// Export all subcomponents for direct use if needed
export * from "./HeadcountByDepartment";
export * from "./RetentionRate";
export * from "./GenderOverview";
export * from "./HiringTrends";
