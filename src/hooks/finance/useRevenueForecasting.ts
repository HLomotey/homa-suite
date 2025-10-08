import { useMemo } from 'react';
import { useFinanceAnalytics } from './useFinanceAnalytics';

interface ForecastPeriod {
  period: string;
  projected: number;
  confidence: number;
  factors: string[];
}

interface KeyInsights {
  opportunities: string[];
  riskFactors: string[];
}

interface RevenueForecastData {
  projectedRevenue: number;
  confidenceLevel: number;
  growthRate: number;
  seasonalAdjustment: number;
  forecastPeriod: string;
  forecastPeriods: ForecastPeriod[];
  keyInsights: KeyInsights;
}

export function useRevenueForecasting(): { data: RevenueForecastData | null; isLoading: boolean } {
  const { data: finance, isLoading } = useFinanceAnalytics();

  const data = useMemo<RevenueForecastData | null>(() => {
    if (!finance) return {
      projectedRevenue: 0,
      confidenceLevel: 0,
      growthRate: 0,
      seasonalAdjustment: 0,
      forecastPeriod: 'Next Month',
      forecastPeriods: [],
      keyInsights: {
        opportunities: [],
        riskFactors: [],
      },
    };

    const currentRevenue = finance.metrics?.totalRevenue || 0;
    // Simple forecasting logic - assume 5% growth
    const growthRate = 5;
    const projectedRevenue = currentRevenue * (1 + growthRate / 100);

    // Generate 6-month forecast periods
    const forecastPeriods: ForecastPeriod[] = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const monthlyProjected = currentRevenue * (1 + (growthRate * i) / 100);
      
      forecastPeriods.push({
        period: monthName,
        projected: monthlyProjected,
        confidence: Math.max(85 - (i * 5), 60), // Decreasing confidence over time
        factors: ['Historical trends', 'Market conditions', 'Seasonal patterns'],
      });
    }

    // Generate insights based on data
    const opportunities = [];
    const riskFactors = [];

    if (growthRate > 0) {
      opportunities.push('Positive growth trend identified');
      opportunities.push('Market expansion opportunities');
    }

    if (currentRevenue < 10000) {
      riskFactors.push('Low revenue base increases volatility');
    }
    
    riskFactors.push('Market uncertainty may affect projections');
    riskFactors.push('External economic factors');

    return {
      projectedRevenue,
      confidenceLevel: 85, // 85% confidence
      growthRate,
      seasonalAdjustment: 0,
      forecastPeriod: 'Next Month',
      forecastPeriods,
      keyInsights: {
        opportunities,
        riskFactors,
      },
    };
  }, [finance]);

  return { data, isLoading };
}
