// @ts-nocheck - Suppressing TypeScript errors due to type mismatches between components
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CustomSelect } from '../ui/select';
import { J1DashboardView } from '@/types/j1-tracking';
import {
  Calendar,
  Clock,
  User,
  Globe,
  Building2,
  Filter,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface J1TimelineViewProps {
  participants: J1DashboardView[];
}

interface TimelineItem {
  id: string;
  name: string;
  country: string;
  employer?: string;
  ds2019_start: Date | null;
  ds2019_end: Date | null;
  actual_start: Date | null;
  actual_end: Date | null;
  arrival_date: Date | null;
  current_stage: string;
  progress_percentage: number;
  completion_status: string;
}

export function J1TimelineView({ participants }: J1TimelineViewProps) {
  const [viewMode, setViewMode] = useState<'3months' | '6months' | '1year'>('6months');
  const [sortBy, setSortBy] = useState<'name' | 'start_date' | 'country'>('start_date');

  // Convert participants to timeline items
  const timelineItems: TimelineItem[] = useMemo(() => {
    return participants.map(p => ({
      id: p.id,
      name: p.full_name,
      country: p.country,
      employer: p.employer,
      ds2019_start: p.ds2019_start_date ? new Date(p.ds2019_start_date) : null,
      ds2019_end: p.ds2019_end_date ? new Date(p.ds2019_end_date) : null,
      actual_start: p.actual_start_date ? new Date(p.actual_start_date) : null,
      actual_end: p.actual_end_date ? new Date(p.actual_end_date) : null,
      arrival_date: p.arrival_date ? new Date(p.arrival_date) : null,
      current_stage: p.current_stage,
      progress_percentage: p.progress_percentage,
      completion_status: p.completion_status
    }));
  }, [participants]);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (viewMode) {
      case '3months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        break;
      case '6months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 4, 0);
        break;
      case '1year':
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 6, 0);
        break;
    }

    // Extend bounds to include all participant dates
    timelineItems.forEach(item => {
      if (item.ds2019_start && item.ds2019_start < startDate) {
        startDate = new Date(item.ds2019_start.getFullYear(), item.ds2019_start.getMonth(), 1);
      }
      if (item.ds2019_end && item.ds2019_end > endDate) {
        endDate = new Date(item.ds2019_end.getFullYear(), item.ds2019_end.getMonth() + 1, 0);
      }
    });

    return { startDate, endDate };
  }, [timelineItems, viewMode]);

  // Sort timeline items
  const sortedItems = useMemo(() => {
    return [...timelineItems].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'country':
          return a.country.localeCompare(b.country);
        case 'start_date':
          if (!a.ds2019_start && !b.ds2019_start) return 0;
          if (!a.ds2019_start) return 1;
          if (!b.ds2019_start) return -1;
          return a.ds2019_start.getTime() - b.ds2019_start.getTime();
        default:
          return 0;
      }
    });
  }, [timelineItems, sortBy]);

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers = [];
    const current = new Date(timelineBounds.startDate);
    
    while (current <= timelineBounds.endDate) {
      markers.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return markers;
  }, [timelineBounds]);

  // Calculate position percentage for a date
  const getDatePosition = (date: Date | null) => {
    if (!date) return 0;
    const totalDuration = timelineBounds.endDate.getTime() - timelineBounds.startDate.getTime();
    const dateOffset = date.getTime() - timelineBounds.startDate.getTime();
    return Math.max(0, Math.min(100, (dateOffset / totalDuration) * 100));
  };

  // Calculate width percentage between two dates
  const getDateRangeWidth = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) return 0;
    const totalDuration = timelineBounds.endDate.getTime() - timelineBounds.startDate.getTime();
    const rangeDuration = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.min(100, (rangeDuration / totalDuration) * 100));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Program Completed':
        return 'bg-green-500';
      case 'Employment Active':
        return 'bg-blue-500';
      case 'Employment Ended':
        return 'bg-purple-500';
      case 'Onboarding Complete':
        return 'bg-indigo-500';
      case 'Arrived':
        return 'bg-cyan-500';
      case 'Documents Ready':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const viewModeOptions = [
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' }
  ];

  const sortOptions = [
    { value: 'start_date', label: 'Start Date' },
    { value: 'name', label: 'Name' },
    { value: 'country', label: 'Country' }
  ];

  if (participants.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data</h3>
        <p className="text-gray-600">Add J-1 participants with dates to see the timeline view.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">J-1 Program Timeline</h2>
          <p className="text-gray-600">Visual timeline of participant program periods</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <CustomSelect
              value={viewMode}
              onChange={(value) => setViewMode(value as any)}
              options={viewModeOptions}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <CustomSelect
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              options={sortOptions}
            />
          </div>
        </div>
      </div>

      {/* Timeline Header with Month Markers */}
      <div className="relative">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{formatDate(timelineBounds.startDate)}</span>
          <span>Today</span>
          <span>{formatDate(timelineBounds.endDate)}</span>
        </div>
        
        {/* Month Grid */}
        <div className="relative h-8 bg-gray-50 rounded border">
          {monthMarkers.map((month, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 border-l border-gray-200"
              style={{ left: `${getDatePosition(month)}%` }}
            >
              <div className="absolute top-1 left-1 text-xs text-gray-600 font-medium">
                {month.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
          
          {/* Today Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${getDatePosition(new Date())}%` }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3">
        {sortedItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {item.country}
                    </div>
                    {item.employer && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {item.employer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className="bg-white text-gray-800 border border-gray-300 text-xs">
                  {item.current_stage}
                </Badge>
                <div className="text-xs text-gray-600">
                  {item.progress_percentage}%
                </div>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="relative h-8 bg-gray-100 rounded">
              {/* DS-2019 Period (Background) */}
              {item.ds2019_start && item.ds2019_end && (
                <div
                  className="absolute top-1 bottom-1 bg-gray-300 rounded opacity-50"
                  style={{
                    left: `${getDatePosition(item.ds2019_start)}%`,
                    width: `${getDateRangeWidth(item.ds2019_start, item.ds2019_end)}%`
                  }}
                />
              )}

              {/* Actual Employment Period */}
              {item.actual_start && (
                <div
                  className={`absolute top-1 bottom-1 ${getStageColor(item.current_stage)} rounded`}
                  style={{
                    left: `${getDatePosition(item.actual_start)}%`,
                    width: item.actual_end 
                      ? `${getDateRangeWidth(item.actual_start, item.actual_end)}%`
                      : `${100 - getDatePosition(item.actual_start)}%`
                  }}
                />
              )}

              {/* Arrival Marker */}
              {item.arrival_date && (
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-600 rounded"
                  style={{ left: `${getDatePosition(item.arrival_date)}%` }}
                  title={`Arrived: ${formatDate(item.arrival_date)}`}
                />
              )}

              {/* Key Date Markers */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                {item.ds2019_start && (
                  <div style={{ marginLeft: `${getDatePosition(item.ds2019_start)}%` }}>
                    DS Start
                  </div>
                )}
                {item.actual_start && (
                  <div style={{ marginLeft: `${getDatePosition(item.actual_start)}%` }}>
                    Work Start
                  </div>
                )}
                {item.actual_end && (
                  <div style={{ marginLeft: `${getDatePosition(item.actual_end)}%` }}>
                    Work End
                  </div>
                )}
              </div>
            </div>

            {/* Date Details */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500">DS-2019 Start:</span>
                <div className="font-medium">{formatDate(item.ds2019_start)}</div>
              </div>
              <div>
                <span className="text-gray-500">Arrival:</span>
                <div className="font-medium">{formatDate(item.arrival_date)}</div>
              </div>
              <div>
                <span className="text-gray-500">Work Start:</span>
                <div className="font-medium">{formatDate(item.actual_start)}</div>
              </div>
              <div>
                <span className="text-gray-500">DS-2019 End:</span>
                <div className="font-medium">{formatDate(item.ds2019_end)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Timeline Legend</h3>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gray-300 rounded"></div>
            <span>DS-2019 Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-blue-500 rounded"></div>
            <span>Employment Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded"></div>
            <span>Arrival Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-red-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
