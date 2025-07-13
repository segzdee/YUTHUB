import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Download, PieChart } from "lucide-react";

interface FinancialReportProps {
  dateRange?: { start: string; end: string };
  properties?: string[];
}

export default function FinancialReport({ dateRange, properties }: FinancialReportProps) {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['/api/reports/financial', dateRange, properties],
  });

  const { data: financialRecords = [] } = useQuery({
    queryKey: ['/api/financial-records'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating financial report...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryData = {
    totalIncome: 125000,
    totalExpenses: 98000,
    netProfit: 27000,
    profitMargin: 21.6,
    budgetVariance: 5.2,
    cashFlow: 15000,
    trends: {
      income: 8.2,
      expenses: 3.1,
      profit: 15.4,
    }
  };

  const expenseCategories = [
    { category: 'Staff Costs', amount: 45000, percentage: 46, budget: 42000 },
    { category: 'Property Maintenance', amount: 15000, percentage: 15, budget: 16000 },
    { category: 'Utilities', amount: 12000, percentage: 12, budget: 11000 },
    { category: 'Training & Development', amount: 8000, percentage: 8, budget: 9000 },
    { category: 'Insurance', amount: 6000, percentage: 6, budget: 6500 },
    { category: 'Other', amount: 12000, percentage: 13, budget: 13500 },
  ];

  const incomeStreams = [
    { stream: 'Occupancy Revenue', amount: 95000, percentage: 76, target: 90000 },
    { stream: 'Support Funding', amount: 25000, percentage: 20, target: 30000 },
    { stream: 'Grants', amount: 5000, percentage: 4, target: 5000 },
  ];

  const exportReport = () => {
    const reportData = {
      title: "Financial Report",
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: summaryData,
      expenses: expenseCategories,
      income: incomeStreams,
      transactions: financialRecords,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Report</h2>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{summaryData.totalIncome.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{summaryData.trends.income}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{summaryData.totalExpenses.toLocaleString()}</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{summaryData.trends.expenses}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{summaryData.netProfit.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{summaryData.trends.profit}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.profitMargin}%</div>
            <p className="text-xs text-muted-foreground">Of total income</p>
          </CardContent>
        </Card>
      </div>

      {/* Income Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Income Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incomeStreams.map((stream) => (
              <div key={stream.stream} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{stream.stream}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stream.percentage}% of total income
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">£{stream.amount.toLocaleString()}</div>
                    <Badge variant={stream.amount >= stream.target ? "default" : "secondary"}>
                      {stream.amount >= stream.target ? 'Target Met' : 'Below Target'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress vs Target</span>
                    <span>{Math.round((stream.amount / stream.target) * 100)}%</span>
                  </div>
                  <Progress value={(stream.amount / stream.target) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenseCategories.map((category) => (
              <div key={category.category} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{category.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.percentage}% of total expenses
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">£{category.amount.toLocaleString()}</div>
                    <Badge variant={category.amount <= category.budget ? "default" : "destructive"}>
                      {category.amount <= category.budget ? 'On Budget' : 'Over Budget'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="font-medium">£{category.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">£{category.budget.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span>{Math.round((category.amount / category.budget) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(category.amount / category.budget) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summaryData.profitMargin}%
              </div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-xs text-green-600">Healthy</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                £{summaryData.cashFlow.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Cash Flow</p>
              <p className="text-xs text-blue-600">Positive</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summaryData.budgetVariance}%
              </div>
              <p className="text-sm text-muted-foreground">Budget Variance</p>
              <p className="text-xs text-yellow-600">Within Range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}