import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";

export interface CompanyPerformance {
  company_name: string;
  projected_revenue: number;
  actual_revenue: number;
  variance: number;
  variance_percentage: number;
  projected_hours?: number;
  actual_hours?: number;
  performance_score: number; // 0-100 scale
  period: string;
}

export interface PerformanceMetrics {
  totalProjectedRevenue: number;
  totalActualRevenue: number;
  overallVariance: number;
  overallVariancePercentage: number;
  performanceScore: number;
  companiesOverPerforming: number;
  companiesUnderPerforming: number;
  companyPerformances: CompanyPerformance[];
  monthlyPerformance: Array<{
    month: string;
    projected: number;
    actual: number;
    variance: number;
    variance_percentage: number;
  }>;
  topPerformers: CompanyPerformance[];
  underPerformers: CompanyPerformance[];
}

interface DateRange {
  year: number;
  month: number;
}

export function usePerformanceAnalytics(dateRanges?: DateRange[]) {
  return useQuery({
    queryKey: ["performance-analytics", dateRanges],
    queryFn: async (): Promise<PerformanceMetrics> => {
      try {
        console.log("Starting performance analytics calculation...");

        // Build date filter conditions
        let dateFilter = "";
        if (dateRanges && dateRanges.length > 0) {
          const dateConditions = dateRanges.map(range => {
            const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
            const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
            return `(date_paid >= '${startDate}' AND date_paid <= '${endDate}')`;
          }).join(' OR ');
          dateFilter = `AND (${dateConditions})`;
        }

        // Fetch projections data
        const { data: projections, error: projError } = await supabase
          .from("projections")
          .select(`
            *,
            staff_locations!fk_projections_location (
              location_description
            ),
            billing_periods!fk_projections_billing_period (
              name,
              start_date,
              end_date
            )
          `)
          .eq("status", "ACTIVE");

        if (projError) {
          console.error("Error fetching projections:", projError);
          throw projError;
        }

        // Fetch finance invoices data with date filtering
        let invoiceQuery = supabase
          .from("finance_invoices")
          .select("*")
          .eq("invoice_status", "paid")
          .not("date_paid", "is", null);

        // Apply date filtering if specified
        if (dateRanges && dateRanges.length > 0) {
          // For simplicity, we'll filter by the first date range
          // In a more complex scenario, you might want to handle multiple ranges differently
          const range = dateRanges[0];
          const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
          const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
          
          invoiceQuery = invoiceQuery
            .gte("date_paid", startDate)
            .lte("date_paid", endDate);
        }

        const { data: invoices, error: invError } = await invoiceQuery;

        if (invError) {
          console.error("Error fetching invoices:", invError);
          throw invError;
        }

        console.log(`Found ${projections?.length || 0} projections and ${invoices?.length || 0} paid invoices`);

        // Create company mapping and performance calculation
        const companyPerformanceMap = new Map<string, {
          projected_revenue: number;
          actual_revenue: number;
          projected_hours: number;
          actual_hours: number;
          period: string;
        }>();

        // Process projections data
        projections?.forEach((projection: any) => {
          // Try to match company names - we'll use a fuzzy matching approach
          const projectionClient = projection.title || projection.location_description || "Unknown";
          const normalizedClient = normalizeCompanyName(projectionClient);
          
          if (!companyPerformanceMap.has(normalizedClient)) {
            companyPerformanceMap.set(normalizedClient, {
              projected_revenue: 0,
              actual_revenue: 0,
              projected_hours: 0,
              actual_hours: 0,
              period: projection.billing_periods?.name || "Unknown Period"
            });
          }

          const company = companyPerformanceMap.get(normalizedClient)!;
          company.projected_revenue += projection.expected_revenue || 0;
          company.projected_hours += projection.expected_hours || 0;
          
          // If we have actual data in projections, use it
          if (projection.actual_revenue) {
            company.actual_revenue += projection.actual_revenue;
          }
          if (projection.actual_hours) {
            company.actual_hours += projection.actual_hours;
          }
        });

        // Process invoice data and match to companies
        invoices?.forEach((invoice: any) => {
          const invoiceClient = invoice.client_name;
          const normalizedClient = normalizeCompanyName(invoiceClient);
          
          // Try to find matching company in projections or create new entry
          let matchedCompany = normalizedClient;
          
          // Look for fuzzy matches in existing projections
          for (const [companyName] of companyPerformanceMap) {
            if (fuzzyMatch(normalizedClient, companyName)) {
              matchedCompany = companyName;
              break;
            }
          }

          if (!companyPerformanceMap.has(matchedCompany)) {
            companyPerformanceMap.set(matchedCompany, {
              projected_revenue: 0,
              actual_revenue: 0,
              projected_hours: 0,
              actual_hours: 0,
              period: formatDatePeriod(invoice.date_paid)
            });
          }

          const company = companyPerformanceMap.get(matchedCompany)!;
          company.actual_revenue += parseFloat(invoice.line_total) || 0;
        });

        // Calculate performance metrics for each company
        const companyPerformances: CompanyPerformance[] = Array.from(companyPerformanceMap.entries())
          .map(([companyName, data]) => {
            const variance = data.actual_revenue - data.projected_revenue;
            const variancePercentage = data.projected_revenue > 0 
              ? (variance / data.projected_revenue) * 100 
              : 0;
            
            // Performance score calculation (0-100)
            let performanceScore = 50; // Base score
            if (data.projected_revenue > 0) {
              const achievementRatio = data.actual_revenue / data.projected_revenue;
              performanceScore = Math.min(100, Math.max(0, achievementRatio * 100));
            }

            return {
              company_name: companyName,
              projected_revenue: data.projected_revenue,
              actual_revenue: data.actual_revenue,
              variance,
              variance_percentage: variancePercentage,
              projected_hours: data.projected_hours,
              actual_hours: data.actual_hours,
              performance_score: performanceScore,
              period: data.period
            };
          })
          .filter(company => company.projected_revenue > 0 || company.actual_revenue > 0)
          .sort((a, b) => b.performance_score - a.performance_score);

        // Calculate overall metrics
        const totalProjectedRevenue = companyPerformances.reduce((sum, c) => sum + c.projected_revenue, 0);
        const totalActualRevenue = companyPerformances.reduce((sum, c) => sum + c.actual_revenue, 0);
        const overallVariance = totalActualRevenue - totalProjectedRevenue;
        const overallVariancePercentage = totalProjectedRevenue > 0 
          ? (overallVariance / totalProjectedRevenue) * 100 
          : 0;
        const performanceScore = totalProjectedRevenue > 0 
          ? Math.min(100, Math.max(0, (totalActualRevenue / totalProjectedRevenue) * 100))
          : 0;

        const companiesOverPerforming = companyPerformances.filter(c => c.variance_percentage > 0).length;
        const companiesUnderPerforming = companyPerformances.filter(c => c.variance_percentage < 0).length;

        // Generate monthly performance data
        const monthlyPerformance = generateMonthlyPerformance(projections || [], invoices || [], dateRanges);

        // Top and bottom performers
        const topPerformers = companyPerformances.slice(0, 5);
        const underPerformers = companyPerformances
          .filter(c => c.variance_percentage < 0)
          .sort((a, b) => a.variance_percentage - b.variance_percentage)
          .slice(0, 5);

        console.log(`Performance Analytics: ${companyPerformances.length} companies analyzed, Overall performance: ${performanceScore.toFixed(1)}%`);

        return {
          totalProjectedRevenue,
          totalActualRevenue,
          overallVariance,
          overallVariancePercentage,
          performanceScore,
          companiesOverPerforming,
          companiesUnderPerforming,
          companyPerformances,
          monthlyPerformance,
          topPerformers,
          underPerformers
        };

      } catch (error) {
        console.error('Error in usePerformanceAnalytics:', error);
        // Return safe default values
        return {
          totalProjectedRevenue: 0,
          totalActualRevenue: 0,
          overallVariance: 0,
          overallVariancePercentage: 0,
          performanceScore: 0,
          companiesOverPerforming: 0,
          companiesUnderPerforming: 0,
          companyPerformances: [],
          monthlyPerformance: [],
          topPerformers: [],
          underPerformers: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper functions
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

function fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return true;
  
  const similarity = (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
  return similarity >= threshold;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function formatDatePeriod(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function generateMonthlyPerformance(projections: any[], invoices: any[], dateRanges?: DateRange[]) {
  const monthlyMap = new Map<string, { projected: number; actual: number }>();
  
  // Process projections by billing period
  projections.forEach(projection => {
    if (projection.billing_periods?.start_date) {
      const month = formatDatePeriod(projection.billing_periods.start_date);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { projected: 0, actual: 0 });
      }
      monthlyMap.get(month)!.projected += projection.expected_revenue || 0;
    }
  });
  
  // Process invoices by payment date
  invoices.forEach(invoice => {
    if (invoice.date_paid) {
      const month = formatDatePeriod(invoice.date_paid);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { projected: 0, actual: 0 });
      }
      monthlyMap.get(month)!.actual += parseFloat(invoice.line_total) || 0;
    }
  });
  
  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      projected: data.projected,
      actual: data.actual,
      variance: data.actual - data.projected,
      variance_percentage: data.projected > 0 ? ((data.actual - data.projected) / data.projected) * 100 : 0
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}
