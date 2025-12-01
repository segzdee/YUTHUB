import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/PageLoader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PiggyBank,
  Calculator,
  FileText,
  AlertCircle,
  Plus,
  Download,
  Calendar,
  BarChart3,
} from 'lucide-react';
import type { FinancialRecord, Property } from '@shared/schema';

export default function Financials() {  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: financialRecords = [], isLoading: financialLoading } = useQuery<
    FinancialRecord[]
  >({
    queryKey: ['/api/financial-records'],
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<
    Property[]
  >({
    queryKey: ['/api/properties'],
  });

  const isLoading = financialLoading || propertiesLoading;

  if (isLoading) {
    return (
      <PageLoader
        title='Financial Management'
        description='Loading financial data...'
        showTabs={true}
        tabCount={4}
        cardCount={6}
        showMetrics={true}
      />
  );
  }

  // Filter financial records
  const filteredRecords = financialRecords.filter(record => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || record.category === categoryFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Calculate financial metrics
  const totalRevenue = financialRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = financialRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const netIncome = totalRevenue - totalExpenses;

  const monthlyRevenue = financialRecords
    .filter(
      r =>
        r.type === 'income' &&
        new Date(r.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyExpenses = financialRecords
    .filter(
      r =>
        r.type === 'expense' &&
        new Date(r.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyNet = monthlyRevenue - monthlyExpenses;

  // Budget categories
  const budgetCategories = [
    {
      name: 'Housing & Accommodation',
      budgeted: 50000,
      spent: 42000,
      category: 'housing',
    },
    {
      name: 'Staff & Payroll',
      budgeted: 80000,
      spent: 78000,
      category: 'staff',
    },
    {
      name: 'Support Services',
      budgeted: 25000,
      spent: 18000,
      category: 'support',
    },
    {
      name: 'Training & Development',
      budgeted: 15000,
      spent: 12000,
      category: 'training',
    },
    {
      name: 'Utilities & Maintenance',
      budgeted: 20000,
      spent: 22000,
      category: 'utilities',
    },
    {
      name: 'Administrative',
      budgeted: 10000,
      spent: 8500,
      category: 'admin',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'housing':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'utilities':
        return 'bg-gray-100 text-gray-800';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetStatus = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return 'over';
    if (percentage > 80) return 'warning';
    return 'good';
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'good':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
          Financials
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Track revenue, expenses, budgets, and financial performance
        </p>
      </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 sm:mb-8'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Revenue
                </CardTitle>
                <DollarSign className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(totalRevenue)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  All time revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Expenses
                </CardTitle>
                <CreditCard className='h-4 w-4 text-red-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(totalExpenses)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  All time expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Net Income
                </CardTitle>
                {netIncome >= 0 ? (
                  <TrendingUp className='h-4 w-4 text-green-600' />
                ) : (
                  <TrendingDown className='h-4 w-4 text-red-600' />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(netIncome)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Total profit/loss
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Monthly Net
                </CardTitle>
                {monthlyNet >= 0 ? (
                  <TrendingUp className='h-4 w-4 text-green-600' />
                ) : (
                  <TrendingDown className='h-4 w-4 text-red-600' />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(monthlyNet)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  This month's net
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue='overview' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='transactions'>Transactions</TabsTrigger>
              <TabsTrigger value='budgets'>Budgets</TabsTrigger>
              <TabsTrigger value='reports'>Reports</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Revenue vs Expenses */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Revenue vs Expenses
                    </CardTitle>
                    <CardDescription>Monthly comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm font-medium'>
                          Monthly Revenue
                        </span>
                        <span className='text-sm font-bold text-green-600'>
                          {formatCurrency(monthlyRevenue)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm font-medium'>
                          Monthly Expenses
                        </span>
                        <span className='text-sm font-bold text-red-600'>
                          {formatCurrency(monthlyExpenses)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center border-t pt-2'>
                        <span className='text-sm font-medium'>Net Income</span>
                        <span
                          className={`text-sm font-bold ${monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(monthlyNet)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Cash Flow</CardTitle>
                    <CardDescription>
                      Current financial position
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center py-8'>
                      <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                      <p className='text-gray-500'>
                        Cash flow chart would go here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <Button className='w-full justify-start'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Transaction
                      </Button>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                      >
                        <Calculator className='h-4 w-4 mr-2' />
                        Create Budget
                      </Button>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                      >
                        <FileText className='h-4 w-4 mr-2' />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm'>Staff Payment</span>
                        <span className='text-sm font-medium text-red-600'>
                          -£2,500
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm'>Government Grant</span>
                        <span className='text-sm font-medium text-green-600'>
                          +£15,000
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm'>Utilities</span>
                        <span className='text-sm font-medium text-red-600'>
                          -£800
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2 p-2 bg-yellow-50 rounded'>
                        <AlertCircle className='h-4 w-4 text-yellow-600' />
                        <span className='text-sm'>
                          Budget exceeded: Utilities
                        </span>
                      </div>
                      <div className='flex items-center gap-2 p-2 bg-blue-50 rounded'>
                        <Receipt className='h-4 w-4 text-blue-600' />
                        <span className='text-sm'>Invoice due: £5,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='transactions' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                  <div className='flex-1 max-w-md'>
                    <Input
                      type='search'
                      inputMode='search'
                      autoComplete='off'
                      placeholder='Search transactions...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='w-full touch-target'
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className='w-40'>
                      <SelectValue placeholder='Filter by type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      <SelectItem value='income'>Income</SelectItem>
                      <SelectItem value='expense'>Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className='w-40'>
                      <SelectValue placeholder='Filter by category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Categories</SelectItem>
                      <SelectItem value='housing'>Housing</SelectItem>
                      <SelectItem value='staff'>Staff</SelectItem>
                      <SelectItem value='support'>Support</SelectItem>
                      <SelectItem value='utilities'>Utilities</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Transaction
                </Button>
              </div>

              <div className='space-y-4'>
                {filteredRecords.length === 0 ? (
                  <Card>
                    <CardContent className='flex items-center justify-center py-8'>
                      <div className='text-center'>
                        <Receipt className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500'>No transactions found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRecords.map(record => (
                    <Card
                      key={record.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              {record.type === 'income' ? (
                                <TrendingUp className='h-5 w-5 text-green-600' />
                              ) : (
                                <TrendingDown className='h-5 w-5 text-red-600' />
                              )}
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {record.description}
                              </CardTitle>
                              <CardDescription className='flex items-center gap-2'>
                                <Calendar className='h-3 w-3' />
                                {new Date(record.date).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Badge className={getTypeColor(record.type)}>
                              {record.type}
                            </Badge>
                            <Badge
                              className={getCategoryColor(record.category)}
                            >
                              {record.category}
                            </Badge>
                            <div className='text-right'>
                              <div
                                className={`text-lg font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {record.type === 'income' ? '+' : '-'}
                                {formatCurrency(record.amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value='budgets' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Budget Performance
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Create Budget
                </Button>
              </div>

              <div className='space-y-4'>
                {budgetCategories.map((budget, index) => {
                  const percentage = (budget.spent / budget.budgeted) * 100;
                  const status = getBudgetStatus(budget.spent, budget.budgeted);

                  return (
                    <Card
                      key={index}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              <PiggyBank className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {budget.name}
                              </CardTitle>
                              <CardDescription>
                                {formatCurrency(budget.spent)} of{' '}
                                {formatCurrency(budget.budgeted)} spent
                              </CardDescription>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div
                              className={`text-lg font-bold ${getBudgetStatusColor(status)}`}
                            >
                              {percentage.toFixed(1)}%
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              {formatCurrency(budget.budgeted - budget.spent)}{' '}
                              remaining
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-2'>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className='h-2'
                          />
                          <div className='flex justify-between text-sm'>
                            <span>Spent: {formatCurrency(budget.spent)}</span>
                            <span>
                              Budget: {formatCurrency(budget.budgeted)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value='reports' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Financial Reports
                </h2>
                <Button className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  Generate Report
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Profit & Loss</CardTitle>
                    <CardDescription>Monthly P&L statement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Revenue</span>
                        <span className='text-sm font-medium text-green-600'>
                          {formatCurrency(monthlyRevenue)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Expenses</span>
                        <span className='text-sm font-medium text-red-600'>
                          {formatCurrency(monthlyExpenses)}
                        </span>
                      </div>
                      <div className='flex justify-between border-t pt-2'>
                        <span className='text-sm font-medium'>Net Income</span>
                        <span
                          className={`text-sm font-bold ${monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(monthlyNet)}
                        </span>
                      </div>
                      <Button size='sm' className='w-full'>
                        <Download className='h-3 w-3 mr-1' />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Budget Report</CardTitle>
                    <CardDescription>Budget vs actual spending</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Total Budgeted</span>
                        <span className='text-sm font-medium'>
                          {formatCurrency(
                            budgetCategories.reduce(
                              (sum, b) => sum + b.budgeted,
                              0
                            )
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Total Spent</span>
                        <span className='text-sm font-medium'>
                          {formatCurrency(
                            budgetCategories.reduce(
                              (sum, b) => sum + b.spent,
                              0
                            )
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between border-t pt-2'>
                        <span className='text-sm font-medium'>Variance</span>
                        <span className='text-sm font-bold text-green-600'>
                          {formatCurrency(
                            budgetCategories.reduce(
                              (sum, b) => sum + (b.budgeted - b.spent),
                              0
                            )
                          )}
                        </span>
                      </div>
                      <Button size='sm' className='w-full'>
                        <Download className='h-3 w-3 mr-1' />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Cash Flow</CardTitle>
                    <CardDescription>
                      Monthly cash flow analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Cash In</span>
                        <span className='text-sm font-medium text-green-600'>
                          {formatCurrency(monthlyRevenue)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Cash Out</span>
                        <span className='text-sm font-medium text-red-600'>
                          {formatCurrency(monthlyExpenses)}
                        </span>
                      </div>
                      <div className='flex justify-between border-t pt-2'>
                        <span className='text-sm font-medium'>
                          Net Cash Flow
                        </span>
                        <span
                          className={`text-sm font-bold ${monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(monthlyNet)}
                        </span>
                      </div>
                      <Button size='sm' className='w-full'>
                        <Download className='h-3 w-3 mr-1' />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
    </div>
  );
}
