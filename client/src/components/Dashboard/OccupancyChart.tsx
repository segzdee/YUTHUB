import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Sample data for occupancy trends
const occupancyData = [
  { month: "Jan", occupancy: 85 },
  { month: "Feb", occupancy: 87 },
  { month: "Mar", occupancy: 82 },
  { month: "Apr", occupancy: 90 },
  { month: "May", occupancy: 88 },
  { month: "Jun", occupancy: 92 },
  { month: "Jul", occupancy: 89 },
  { month: "Aug", occupancy: 91 },
  { month: "Sep", occupancy: 88 },
  { month: "Oct", occupancy: 85 },
  { month: "Nov", occupancy: 87 },
  { month: "Dec", occupancy: 90 },
];

interface OccupancyData {
  month: string;
  occupancy: number;
  capacity: number;
  rate: number;
}

const mockData: OccupancyData[] = [
  { month: "Jan", occupancy: 42, capacity: 50, rate: 84 },
  { month: "Feb", occupancy: 45, capacity: 50, rate: 90 },
  { month: "Mar", occupancy: 44, capacity: 50, rate: 88 },
  { month: "Apr", occupancy: 47, capacity: 52, rate: 90.4 },
  { month: "May", occupancy: 48, capacity: 52, rate: 92.3 },
  { month: "Jun", occupancy: 46, capacity: 52, rate: 88.5 },
  { month: "Jul", occupancy: 49, capacity: 52, rate: 94.2 },
  { month: "Aug", occupancy: 48, capacity: 52, rate: 92.3 },
  { month: "Sep", occupancy: 50, capacity: 55, rate: 90.9 },
  { month: "Oct", occupancy: 52, capacity: 55, rate: 94.5 },
  { month: "Nov", occupancy: 51, capacity: 55, rate: 92.7 },
  { month: "Dec", occupancy: 48, capacity: 55, rate: 87.3 },
];

export default function OccupancyChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("3M");

  const periods = ["3M", "6M", "1Y"];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Occupancy Trends</CardTitle>
          <div className="flex space-x-2">
            {periods.map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={
                  selectedPeriod === period ? "bg-primary text-white" : ""
                }
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "rate" ? `${value}%` : value,
                  name === "rate"
                    ? "Occupancy Rate"
                    : name === "occupancy"
                    ? "Occupied Units"
                    : "Total Capacity",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">92.1%</p>
            <p className="text-sm text-muted-foreground">Average Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">48</p>
            <p className="text-sm text-muted-foreground">Current Occupied</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">55</p>
            <p className="text-sm text-muted-foreground">Total Capacity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
