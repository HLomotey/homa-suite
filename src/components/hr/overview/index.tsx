import { HeadcountByDepartment } from "./HeadcountByDepartment";
import { RetentionRate } from "./RetentionRate";
import { GenderOverview } from "./GenderOverview";
import { HiringTrends } from "./HiringTrends";

export function HROverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HeadcountByDepartment />
        <RetentionRate />
        <GenderOverview />
        <HiringTrends />
      </div>
    </div>
  );
}

export {
  HeadcountByDepartment,
  RetentionRate,
  GenderOverview,
  HiringTrends,
};

// Export all subcomponents for direct use if needed
export * from "./HeadcountByDepartment";
export * from "./RetentionRate";
export * from "./GenderOverview";
export * from "./HiringTrends";
