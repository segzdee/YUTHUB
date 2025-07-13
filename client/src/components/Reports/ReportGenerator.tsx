import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, FileText, BarChart3, Calendar, Filter } from "lucide-react";

interface ReportGeneratorProps {
  onGenerate?: (reportData: any) => void;
}

export default function ReportGenerator({ onGenerate }: ReportGeneratorProps) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const reportTypes = [
    { value: 'occupancy', label: 'Occupancy Report', description: 'Property occupancy rates and trends' },
    { value: 'financial', label: 'Financial Report', description: 'Income, expenses, and profit/loss analysis' },
    { value: 'incident', label: 'Incident Report', description: 'Safety incidents and risk analysis' },
    { value: 'progress', label: 'Progress Report', description: 'Resident progress and outcomes' },
    { value: 'compliance', label: 'Compliance Report', description: 'Regulatory compliance status' },
    { value: 'risk', label: 'Risk Assessment Report', description: 'Risk factors and mitigation strategies' },
    { value: 'maintenance', label: 'Maintenance Report', description: 'Maintenance requests and completion rates' },
    { value: 'staff', label: 'Staff Performance Report', description: 'Staff workload and performance metrics' },
  ];

  const generateReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const reportData = await apiRequest("POST", "/api/reports/generate", {
        type: reportType,
        dateRange,
        properties: selectedProperties,
        filters: selectedFilters,
      });

      onGenerate?.(reportData);
      
      // Generate downloadable report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportFilters = (type: string) => {
    const filters = {
      occupancy: ['by_property', 'by_month', 'show_trends', 'include_vacant'],
      financial: ['by_category', 'by_property', 'show_budget_variance', 'include_projections'],
      incident: ['by_severity', 'by_type', 'by_property', 'show_trends'],
      progress: ['by_resident', 'by_goal_type', 'show_achievements', 'include_assessments'],
      compliance: ['by_regulation', 'by_property', 'show_gaps', 'include_actions'],
      risk: ['by_level', 'by_category', 'by_property', 'show_mitigation'],
      maintenance: ['by_priority', 'by_category', 'by_property', 'show_costs'],
      staff: ['by_department', 'by_role', 'show_workload', 'include_training'],
    };
    return filters[type as keyof typeof filters] || [];
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Properties (optional)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {properties.map((property: any) => (
                  <div key={property.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`property-${property.id}`}
                      checked={selectedProperties.includes(property.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProperties([...selectedProperties, property.id.toString()]);
                        } else {
                          setSelectedProperties(selectedProperties.filter(id => id !== property.id.toString()));
                        }
                      }}
                    />
                    <Label htmlFor={`property-${property.id}`} className="text-sm">
                      {property.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {reportType && (
          <div>
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Report Filters
            </Label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {getReportFilters(reportType).map((filter) => (
                <div key={filter} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-${filter}`}
                    checked={selectedFilters.includes(filter)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFilters([...selectedFilters, filter]);
                      } else {
                        setSelectedFilters(selectedFilters.filter(f => f !== filter));
                      }
                    }}
                  />
                  <Label htmlFor={`filter-${filter}`} className="text-sm">
                    {filter.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setReportType("");
              setDateRange({ start: "", end: "" });
              setSelectedProperties([]);
              setSelectedFilters([]);
            }}
          >
            Clear
          </Button>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Calendar className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}