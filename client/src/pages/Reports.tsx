import { useState } from "react";
import Layout from "@/components/Layout";
import ReportGenerator from "@/components/Reports/ReportGenerator";
import OccupancyReport from "@/components/Reports/OccupancyReport";
import FinancialReport from "@/components/Reports/FinancialReport";
import IncidentReport from "@/components/Reports/IncidentReport";
import ProgressReport from "@/components/Reports/ProgressReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Wrench, 
  Users, 
  FileCheck,
  ArrowLeft 
} from "lucide-react";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    {
      id: "occupancy",
      title: "Occupancy Report",
      description: "Property occupancy rates, trends, and vacancy analysis",
      icon: BarChart3,
      component: OccupancyReport,
      category: "Housing",
      complexity: "Medium",
    },
    {
      id: "financial",
      title: "Financial Report", 
      description: "Income, expenses, profit analysis, and budget tracking",
      icon: DollarSign,
      component: FinancialReport,
      category: "Finance",
      complexity: "High",
    },
    {
      id: "incident",
      title: "Incident Report",
      description: "Safety incidents, risk analysis, and resolution tracking",
      icon: AlertTriangle,
      component: IncidentReport,
      category: "Safety",
      complexity: "Medium",
    },
    {
      id: "progress",
      title: "Progress Report",
      description: "Resident progress, goal achievements, and outcomes",
      icon: TrendingUp,
      component: ProgressReport,
      category: "Residents",
      complexity: "High",
    },
  ];

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const handleBackToReports = () => {
    setSelectedReport(null);
    setReportData(null);
  };

  const handleReportGenerate = (data: any) => {
    setReportData(data);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Housing": return "bg-blue-100 text-blue-800";
      case "Finance": return "bg-green-100 text-green-800";
      case "Safety": return "bg-red-100 text-red-800";
      case "Residents": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const selectedReportType = reportTypes.find(r => r.id === selectedReport);

  return (
    <Layout>
      <div className="space-y-6">
        {selectedReport ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToReports}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
              <h1 className="text-2xl font-bold">{selectedReportType?.title}</h1>
            </div>
            
            {selectedReportType && (
              <selectedReportType.component />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground">
                Generate comprehensive reports to track performance, analyze trends, and make data-driven decisions.
              </p>
            </div>

            {/* Report Generator */}
            <ReportGenerator onGenerate={handleReportGenerate} />

            {/* Quick Report Access */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Report Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{report.title}</CardTitle>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getCategoryColor(report.category)}>
                              {report.category}
                            </Badge>
                            <Badge className={getComplexityColor(report.complexity)}>
                              {report.complexity}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          {report.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleReportSelect(report.id)}
                            size="sm"
                          >
                            View Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Report Categories */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Report Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base">Housing Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Occupancy rates, property performance, and housing trends
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-base">Financial Analysis</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Revenue, expenses, budgets, and financial health metrics
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-base">Resident Progress</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Goal tracking, outcomes, and independence development
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-base">Safety & Compliance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Incidents, risk assessments, and regulatory compliance
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}