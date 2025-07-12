import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

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
                className={selectedPeriod === period ? "bg-primary text-white" : ""}
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
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Occupancy Rate']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="occupancy" fill="hsl(207, 90%, 54%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
