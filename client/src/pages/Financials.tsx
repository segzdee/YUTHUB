import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp, TrendingDown, Download, Calendar } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Financials() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  const { data: financialRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['/api/financial-records'],
  });

  if (recordsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading financial data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const financialSummary = {
    totalRevenue: 125000,
    totalExpenses: 98000,
    netIncome: 27000,
    occupancyRevenue: 95000,
    supportFunding: 30000,
  };

  const expenseCategories = [
    { category: 'Staff Costs', amount: 45000, percentage: 46 },
    { category: 'Property Maintenance', amount: 15000, percentage: 15 },
    { category: 'Utilities', amount: 12000, percentage: 12 },
    { category: 'Training & Development', amount: 8000, percentage: 8 },
    { category: 'Insurance', amount: 6000, percentage: 6 },
    { category: 'Other', amount: 12000, percentage: 13 },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Financials</h1>
                <p className="text-muted-foreground mt-2">
                  Monitor financial performance and manage budgets
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{financialSummary.totalRevenue.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +8.2% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{financialSummary.totalExpenses.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-red-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +3.1% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{financialSummary.netIncome.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +15.4% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">21.6%</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +2.1% from last month
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseCategories.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-sm">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">£{category.amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Revenue Streams</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Revenue
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Occupancy Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">£{financialSummary.occupancyRevenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      From resident accommodation fees
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Average weekly rate</span>
                        <span>£285</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Occupancy rate</span>
                        <span>92%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Funding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">£{financialSummary.supportFunding.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      From local authority contracts
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Contract value</span>
                        <span>£360,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span>85%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Expense Management</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </div>

              <div className="grid gap-4">
                {financialRecords.map((record: any) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{record.description}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={record.type === 'income' ? 'default' : 'destructive'}>
                            {record.type}
                          </Badge>
                          <span className="text-lg font-bold">
                            £{record.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium">{record.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment Method</p>
                          <p className="font-medium">{record.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant="outline">{record.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Financial Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comprehensive monthly financial analysis including P&L, cash flow, and budget variance
                    </p>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget vs Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compare actual spending against budget allocations
                    </p>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cash Flow Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      12-month cash flow projection and analysis
                    </p>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete audit trail of all financial transactions
                    </p>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}