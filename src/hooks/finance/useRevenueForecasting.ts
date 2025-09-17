/**
 * Revenue Forecasting Hook - Provides predictive analytics based on historical data
 * Uses finance_invoices and projections data to generate revenue forecasts
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseAdmin } from "@/integration/supabase/client";

// Function to invalidate revenue forecasting cache
export const invalidateRevenueForecastCache = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["revenue-forecast"] });
  queryClient.invalidateQueries({ queryKey: ["revenue-trends"] });
  queryClient.invalidateQueries({ queryKey: ["growth-metrics"] });
};

export interface RevenueForecastMetrics {
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
  confidenceLevel: number;
  forecastPeriods: Array<{
    period: string;
    projected: number;
    confidence: number;
    factors: string[];
    historicalAverage: number;
    projectionBased: number;
  }>;
  revenueBySource: Array<{
    source: string;
    amount: number;
    percentage: number;
    growth: number;
    forecast: number;
  }>;
  seasonalTrends: Array<{
    month: number;
    monthName: string;
    averageRevenue: number;
    seasonalFactor: number;
    historicalData: number[];
  }>;
  growthMetrics: {
    monthOverMonth: number;
    quarterOverQuarter: number;
    yearOverYear: number;
    averageGrowthRate: number;
    volatility: number;
  };
  keyInsights: {
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    bestPerformingMonth: string;
    worstPerformingMonth: string;
    mostReliableSource: string;
    riskFactors: string[];
    opportunities: string[];
  };
  isDataComplete: boolean;
}

interface DateRange {
  year: number;
  month: number;
}

// Fetch historical revenue data for forecasting
const fetchHistoricalRevenueData = async (monthsBack: number = 24) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  
  const { data, error } = await supabaseAdmin
    .from("finance_invoices")
    .select("*")
    .eq('invoice_status', 'paid')
    .not('date_paid', 'is', null)
    .gte('date_paid', startDate.toISOString().split('T')[0])
    .order('date_paid', { ascending: true });

  if (error) {
    console.error("Error fetching historical revenue data:", error);
    throw error;
  }

  return data || [];
};

// Fetch projection data for forecasting
const fetchProjectionForecastData = async () => {
  const { data, error } = await supabaseAdmin
    .from("projections")
    .select("*")
    .in('status', ['active', 'draft'])
    .gte('projection_date', new Date().toISOString().split('T')[0])
    .order('projection_date', { ascending: true });

  if (error) {
    console.error("Error fetching projection forecast data:", error);
    throw error;
  }

  return data || [];
};

// Calculate linear regression for trend analysis
const calculateLinearRegression = (data: number[]): { slope: number; intercept: number; r2: number } => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = data.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = data.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const ssTot = data.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  return { slope, intercept, r2 };
};

// Calculate seasonal factors
const calculateSeasonalFactors = (monthlyData: Record<string, number[]>): Record<number, number> => {
  const seasonalFactors: Record<number, number> = {};
  
  for (let month = 0; month < 12; month++) {
    const monthData = Object.entries(monthlyData)
      .filter(([key]) => new Date(key).getMonth() === month)
      .map(([, values]) => values)
      .flat();
    
    if (monthData.length > 0) {
      const monthAverage = monthData.reduce((a, b) => a + b, 0) / monthData.length;
      const overallAverage = Object.values(monthlyData)
        .flat()
        .reduce((sum, values) => sum + values.reduce((a, b) => a + b, 0), 0) / 
        Object.values(monthlyData).flat().length;
      
      seasonalFactors[month] = overallAverage > 0 ? monthAverage / overallAverage : 1;
    } else {
      seasonalFactors[month] = 1;
    }
  }
  
  return seasonalFactors;
};

// Process revenue forecasting data
const processRevenueForecastData = (
  historicalData: any[],
  projectionData: any[]
): RevenueForecastMetrics => {
  
  // Group historical data by month
  const monthlyRevenue = historicalData.reduce((acc, invoice) => {
    const month = new Date(invoice.date_paid).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(parseFloat(invoice.line_total) || 0);
    return acc;
  }, {} as Record<string, number[]>);

  // Calculate monthly totals
  const monthlyTotals = Object.entries(monthlyRevenue).map(([month, amounts]) => ({
    month,
    total: amounts.reduce((a, b) => a + b, 0),
    count: amounts.length,
    average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Current revenue (last month)
  const currentRevenue = monthlyTotals.length > 0 
    ? monthlyTotals[monthlyTotals.length - 1].total 
    : 0;

  // Calculate growth metrics
  const revenueValues = monthlyTotals.map(m => m.total);
  const regression = calculateLinearRegression(revenueValues);
  const growthRate = revenueValues.length > 1 
    ? ((revenueValues[revenueValues.length - 1] - revenueValues[0]) / revenueValues[0]) * 100 / revenueValues.length
    : 0;

  // Calculate month-over-month growth
  const monthOverMonth = revenueValues.length >= 2
    ? ((revenueValues[revenueValues.length - 1] - revenueValues[revenueValues.length - 2]) / revenueValues[revenueValues.length - 2]) * 100
    : 0;

  // Calculate volatility (standard deviation of growth rates)
  const growthRates = [];
  for (let i = 1; i < revenueValues.length; i++) {
    if (revenueValues[i - 1] > 0) {
      growthRates.push(((revenueValues[i] - revenueValues[i - 1]) / revenueValues[i - 1]) * 100);
    }
  }
  const avgGrowthRate = growthRates.length > 0 
    ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length 
    : 0;
  const volatility = growthRates.length > 0
    ? Math.sqrt(growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / growthRates.length)
    : 0;

  // Projected revenue from projections table
  const projectedRevenue = projectionData.reduce((sum, proj) => 
    sum + (parseFloat(proj.expected_revenue) || 0), 0
  );

  // Generate forecast periods (next 6 months)
  const forecastPeriods = [];
  const baseDate = new Date();
  
  for (let i = 1; i <= 6; i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    
    const period = forecastDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    // Historical trend-based forecast
    const trendForecast = regression.slope * (revenueValues.length + i - 1) + regression.intercept;
    
    // Projection-based forecast (if available for this period)
    const projectionForecast = projectionData
      .filter(proj => {
        const projDate = new Date(proj.projection_date);
        return projDate.getMonth() === forecastDate.getMonth() && 
               projDate.getFullYear() === forecastDate.getFullYear();
      })
      .reduce((sum, proj) => sum + (parseFloat(proj.expected_revenue) || 0), 0);

    // Combined forecast (weighted average)
    const historicalWeight = 0.6;
    const projectionWeight = 0.4;
    const combinedForecast = projectionForecast > 0 
      ? (trendForecast * historicalWeight + projectionForecast * projectionWeight)
      : trendForecast;

    // Confidence decreases over time and with higher volatility
    const baseConfidence = Math.max(50, regression.r2 * 100);
    const timeDecay = Math.max(0.1, 1 - (i * 0.1));
    const volatilityAdjustment = Math.max(0.5, 1 - (volatility / 100));
    const confidence = baseConfidence * timeDecay * volatilityAdjustment;

    forecastPeriods.push({
      period,
      projected: Math.max(0, combinedForecast),
      confidence: Math.min(95, confidence),
      factors: [
        `Historical trend (${regression.r2 > 0.7 ? 'strong' : regression.r2 > 0.4 ? 'moderate' : 'weak'})`,
        projectionForecast > 0 ? 'Projection data available' : 'No projection data',
        volatility > 20 ? 'High volatility' : volatility > 10 ? 'Moderate volatility' : 'Low volatility'
      ],
      historicalAverage: trendForecast,
      projectionBased: projectionForecast,
    });
  }

  // Revenue by source (client analysis)
  const revenueByClient = historicalData.reduce((acc, invoice) => {
    const client = invoice.client_name || 'Unknown';
    if (!acc[client]) acc[client] = [];
    acc[client].push(parseFloat(invoice.line_total) || 0);
    return acc;
  }, {} as Record<string, number[]>);

  const revenueBySource = Object.entries(revenueByClient)
    .map(([source, amounts]) => {
      const total = amounts.reduce((a, b) => a + b, 0);
      const totalRevenue = Object.values(revenueByClient)
        .flat()
        .reduce((a, b) => a + b, 0);
      
      // Calculate growth for this source (simplified)
      const recentAmounts = amounts.slice(-3); // Last 3 transactions
      const olderAmounts = amounts.slice(0, -3);
      const recentAvg = recentAmounts.length > 0 
        ? recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length 
        : 0;
      const olderAvg = olderAmounts.length > 0 
        ? olderAmounts.reduce((a, b) => a + b, 0) / olderAmounts.length 
        : 0;
      const growth = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      // Simple forecast for this source
      const forecast = total * (1 + (growth / 100));

      return {
        source,
        amount: total,
        percentage: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0,
        growth,
        forecast: Math.max(0, forecast),
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Seasonal trends
  const seasonalData = historicalData.reduce((acc, invoice) => {
    const date = new Date(invoice.date_paid);
    const month = date.getMonth();
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    
    if (!acc[month]) {
      acc[month] = { monthName, data: [] };
    }
    acc[month].data.push(parseFloat(invoice.line_total) || 0);
    return acc;
  }, {} as Record<number, { monthName: string; data: number[] }>);

  const seasonalTrends = Array.from({ length: 12 }, (_, month) => {
    const monthData = seasonalData[month];
    const data = monthData?.data || [];
    const averageRevenue = data.length > 0 
      ? data.reduce((a, b) => a + b, 0) / data.length 
      : 0;
    
    // Calculate seasonal factor
    const overallAverage = Object.values(seasonalData)
      .map(d => d.data)
      .flat()
      .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
    
    const seasonalFactor = overallAverage > 0 ? averageRevenue / overallAverage : 1;

    return {
      month: month + 1,
      monthName: new Date(2024, month, 1).toLocaleDateString("en-US", { month: "long" }),
      averageRevenue,
      seasonalFactor,
      historicalData: data,
    };
  });

  // Key insights
  const bestMonth = seasonalTrends.reduce((best, current) => 
    current.averageRevenue > best.averageRevenue ? current : best
  );
  const worstMonth = seasonalTrends.reduce((worst, current) => 
    current.averageRevenue < worst.averageRevenue ? current : worst
  );
  const mostReliableSource = revenueBySource.length > 0 ? revenueBySource[0].source : 'None';

  const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
    growthRate > 5 ? 'increasing' : 
    growthRate < -5 ? 'decreasing' : 'stable';

  const riskFactors = [];
  const opportunities = [];

  if (volatility > 20) riskFactors.push('High revenue volatility');
  if (revenueBySource.length > 0 && revenueBySource[0].percentage > 50) {
    riskFactors.push('High client concentration risk');
  }
  if (regression.r2 < 0.4) riskFactors.push('Unpredictable revenue trends');

  if (growthRate > 0) opportunities.push('Positive growth trend');
  if (projectedRevenue > currentRevenue) opportunities.push('Strong pipeline projections');
  if (seasonalTrends.some(t => t.seasonalFactor > 1.2)) {
    opportunities.push('Seasonal revenue opportunities identified');
  }

  return {
    currentRevenue,
    projectedRevenue,
    growthRate,
    confidenceLevel: Math.min(95, Math.max(50, regression.r2 * 100)),
    forecastPeriods,
    revenueBySource,
    seasonalTrends,
    growthMetrics: {
      monthOverMonth,
      quarterOverQuarter: 0, // Would need quarterly calculation
      yearOverYear: 0, // Would need year-over-year data
      averageGrowthRate: avgGrowthRate,
      volatility,
    },
    keyInsights: {
      trendDirection,
      bestPerformingMonth: bestMonth.monthName,
      worstPerformingMonth: worstMonth.monthName,
      mostReliableSource,
      riskFactors,
      opportunities,
    },
    isDataComplete: true,
  };
};

export function useRevenueForecasting(monthsOfHistory: number = 24) {
  return useQuery({
    queryKey: ["revenue-forecast", monthsOfHistory],
    queryFn: async (): Promise<RevenueForecastMetrics> => {
      try {
        console.log("Starting revenue forecasting analysis...");

        const [historicalData, projectionData] = await Promise.all([
          fetchHistoricalRevenueData(monthsOfHistory),
          fetchProjectionForecastData(),
        ]);

        console.log(`Forecast data: ${historicalData.length} historical records, ${projectionData.length} projections`);

        const processedData = processRevenueForecastData(historicalData, projectionData);

        console.log(`Revenue forecast: Current $${processedData.currentRevenue.toFixed(2)}, Growth ${processedData.growthRate.toFixed(1)}%`);

        return processedData;
      } catch (error) {
        console.error('Error in useRevenueForecasting:', error);
        return {
          currentRevenue: 0,
          projectedRevenue: 0,
          growthRate: 0,
          confidenceLevel: 0,
          forecastPeriods: [],
          revenueBySource: [],
          seasonalTrends: [],
          growthMetrics: {
            monthOverMonth: 0,
            quarterOverQuarter: 0,
            yearOverYear: 0,
            averageGrowthRate: 0,
            volatility: 0,
          },
          keyInsights: {
            trendDirection: 'stable',
            bestPerformingMonth: 'Unknown',
            worstPerformingMonth: 'Unknown',
            mostReliableSource: 'None',
            riskFactors: ['Insufficient data'],
            opportunities: [],
          },
          isDataComplete: false,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for growth metrics only
export function useGrowthMetrics(dateRanges?: DateRange[]) {
  return useQuery({
    queryKey: ["growth-metrics", dateRanges],
    queryFn: async () => {
      try {
        const historicalData = await fetchHistoricalRevenueData(12);
        
        const monthlyTotals = historicalData.reduce((acc, invoice) => {
          const month = new Date(invoice.date_paid).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });
          if (!acc[month]) acc[month] = 0;
          acc[month] += parseFloat(invoice.line_total) || 0;
          return acc;
        }, {} as Record<string, number>);

        const values = Object.values(monthlyTotals);
        const regression = calculateLinearRegression(values);

        return {
          trendStrength: regression.r2,
          averageGrowthRate: values.length > 1 
            ? ((values[values.length - 1] - values[0]) / values[0]) * 100 / values.length
            : 0,
          isGrowing: regression.slope > 0,
          confidence: regression.r2 * 100,
        };
      } catch (error) {
        console.error('Error in useGrowthMetrics:', error);
        return {
          trendStrength: 0,
          averageGrowthRate: 0,
          isGrowing: false,
          confidence: 0,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}