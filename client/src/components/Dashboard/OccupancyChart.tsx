import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Building } from 'lucide-react';
import { useOccupancyTrend } from '@/hooks/useDashboardData';

export default function OccupancyChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const { data: occupancyData = [], isLoading, error } = useOccupancyTrend();

  const periods = ['3M', '6M', '1Y'];
  const hasData = occupancyData && occupancyData.length > 0;

  return (
    <Card className='lg:col-span-2'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Occupancy Trends</CardTitle>
          <div className='flex space-x-2'>
            {periods.map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setSelectedPeriod(period)}
                className={
                  selectedPeriod === period ? 'bg-primary text-white' : ''
                }
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='h-64 flex items-center justify-center'>
            <Skeleton className='h-full w-full' />
          </div>
        ) : error ? (
          <div className='h-64 flex flex-col items-center justify-center text-center px-4'>
            <AlertTriangle className='h-12 w-12 text-amber-500 mb-3' />
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Unable to load occupancy trends
            </p>
          </div>
        ) : !hasData ? (
          <div className='h-64 flex flex-col items-center justify-center text-center px-4'>
            <div className='rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-3'>
              <Building className='h-12 w-12 text-gray-400' />
            </div>
            <p className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-1'>
              No Data Available
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Add properties and residents to see occupancy trends
            </p>
          </div>
        ) : (
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={occupancyData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'occupancy' ? `${value}%` : value,
                  name === 'occupancy'
                    ? 'Occupancy Rate'
                    : 'Total Capacity',
                ]}
                labelFormatter={label => `Month: ${label}`}
              />
              <Area
                type='monotone'
                dataKey='occupancy'
                stroke='#2563eb'
                fill='#3b82f6'
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
