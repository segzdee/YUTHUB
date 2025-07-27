import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Download,
  Send,
  CheckCircle,
  Users,
  TrendingUp,
  Building,
} from 'lucide-react';
import type {
  GovernmentClient,
  Invoice,
  BillingPeriod,
  SupportLevelRate,
  Resident,
} from '@shared/schema';

export default function Billing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: governmentClients = [] } = useQuery<GovernmentClient[]>({
    queryKey: ['/api/government-clients'],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: billingPeriods = [] } = useQuery<BillingPeriod[]>({
    queryKey: ['/api/billing-periods'],
  });

  const { data: supportLevelRates = [] } = useQuery<SupportLevelRate[]>({
    queryKey: ['/api/support-level-rates'],
  });

  const { data: residents = [] } = useQuery<Resident[]>({
    queryKey: ['/api/residents'],
  });

  const { data: billingAnalytics } = useQuery({
    queryKey: ['/api/billing/analytics'],
  });

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      governmentClients
        .find(c => c.id === invoice.clientId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientName = (clientId: number) => {
    const client = governmentClients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const totalRevenue = billingAnalytics?.totalRevenue || 0;
  const monthlyRevenue = billingAnalytics?.monthlyRevenue || 0;
  const outstandingAmount = billingAnalytics?.outstandingAmount || 0;
  const paidInvoices = billingAnalytics?.paidInvoices || 0;
  const pendingInvoices = billingAnalytics?.pendingInvoices || 0;
  const overdueInvoices = billingAnalytics?.overdueInvoices || 0;

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className='flex-1 lg:ml-64 flex flex-col'>
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Government Billing
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage government contracts, invoicing, and payment tracking
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
                  Monthly Revenue
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(monthlyRevenue)}
                </div>
                <p className='text-xs text-muted-foreground'>Current month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Outstanding
                </CardTitle>
                <AlertTriangle className='h-4 w-4 text-red-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(outstandingAmount)}
                </div>
                <p className='text-xs text-muted-foreground'>Unpaid invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Clients
                </CardTitle>
                <Users className='h-4 w-4 text-purple-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {governmentClients.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Government clients
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue='invoices' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-5'>
              <TabsTrigger value='invoices'>Invoices</TabsTrigger>
              <TabsTrigger value='clients'>Clients</TabsTrigger>
              <TabsTrigger value='rates'>Rates</TabsTrigger>
              <TabsTrigger value='periods'>Periods</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value='invoices' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                  <div className='flex-1 max-w-md'>
                    <Input
                      placeholder='Search invoices...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='w-full'
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-40'>
                      <SelectValue placeholder='Filter by status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Status</SelectItem>
                      <SelectItem value='paid'>Paid</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='overdue'>Overdue</SelectItem>
                      <SelectItem value='draft'>Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Create Invoice
                </Button>
              </div>

              {/* Invoice Summary */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Invoice Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Paid</span>
                        <Badge className='bg-green-100 text-green-800'>
                          {paidInvoices}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Pending</span>
                        <Badge className='bg-yellow-100 text-yellow-800'>
                          {pendingInvoices}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Overdue</span>
                        <Badge className='bg-red-100 text-red-800'>
                          {overdueInvoices}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                      >
                        <Send className='h-4 w-4 mr-2' />
                        Send Reminders
                      </Button>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                      >
                        <Download className='h-4 w-4 mr-2' />
                        Export Invoices
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
                    <CardTitle className='text-lg'>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Total Invoiced</span>
                        <span className='text-sm font-medium'>
                          {formatCurrency(totalRevenue + outstandingAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Paid</span>
                        <span className='text-sm font-medium text-green-600'>
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm'>Outstanding</span>
                        <span className='text-sm font-medium text-red-600'>
                          {formatCurrency(outstandingAmount)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice List */}
              <div className='space-y-4'>
                {filteredInvoices.length === 0 ? (
                  <Card>
                    <CardContent className='flex items-center justify-center py-8'>
                      <div className='text-center'>
                        <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500'>No invoices found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredInvoices.map(invoice => (
                    <Card
                      key={invoice.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              <FileText className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {invoice.invoiceNumber}
                              </CardTitle>
                              <CardDescription className='flex items-center gap-2'>
                                <span>{getClientName(invoice.clientId)}</span>
                                <span>•</span>
                                <Calendar className='h-3 w-3' />
                                <span>
                                  {new Date(
                                    invoice.issueDate
                                  ).toLocaleDateString()}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <div className='text-right'>
                              <div className='text-lg font-bold'>
                                {formatCurrency(invoice.totalAmount)}
                              </div>
                              <div className='text-sm text-gray-600 dark:text-gray-400'>
                                Due:{' '}
                                {new Date(invoice.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='flex justify-between items-center'>
                          <div className='text-sm text-gray-600 dark:text-gray-400'>
                            {invoice.description ||
                              'Government billing invoice'}
                          </div>
                          <div className='flex gap-2'>
                            <Button size='sm' variant='outline'>
                              <Download className='h-3 w-3 mr-1' />
                              Download
                            </Button>
                            <Button size='sm' variant='outline'>
                              <Send className='h-3 w-3 mr-1' />
                              Send
                            </Button>
                            <Button size='sm'>View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value='clients' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Government Clients
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Client
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {governmentClients.map(client => (
                  <Card
                    key={client.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Building className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {client.name}
                            </CardTitle>
                            <CardDescription>
                              {client.department}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className='bg-blue-100 text-blue-800'>
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <span className='text-gray-600 dark:text-gray-400'>
                              Contact
                            </span>
                            <div className='font-medium'>
                              {client.contactPerson}
                            </div>
                          </div>
                          <div>
                            <span className='text-gray-600 dark:text-gray-400'>
                              Phone
                            </span>
                            <div className='font-medium'>{client.phone}</div>
                          </div>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Email
                          </span>
                          <div className='font-medium'>{client.email}</div>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Address
                          </span>
                          <div className='font-medium'>{client.address}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='rates' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Support Level Rates
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Rate
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {supportLevelRates.map(rate => (
                  <Card
                    key={rate.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        {rate.supportLevel}
                      </CardTitle>
                      <CardDescription>{rate.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='text-center'>
                          <div className='text-3xl font-bold text-primary'>
                            {formatCurrency(rate.hourlyRate)}
                          </div>
                          <div className='text-sm text-gray-600 dark:text-gray-400'>
                            per hour
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <span className='text-gray-600 dark:text-gray-400'>
                              Weekly
                            </span>
                            <div className='font-medium'>
                              {formatCurrency(rate.weeklyRate)}
                            </div>
                          </div>
                          <div>
                            <span className='text-gray-600 dark:text-gray-400'>
                              Monthly
                            </span>
                            <div className='font-medium'>
                              {formatCurrency(rate.monthlyRate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='periods' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Billing Periods
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Create Period
                </Button>
              </div>

              <div className='space-y-4'>
                {billingPeriods.map(period => (
                  <Card
                    key={period.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Calendar className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {new Date(period.startDate).toLocaleDateString()}{' '}
                              - {new Date(period.endDate).toLocaleDateString()}
                            </CardTitle>
                            <CardDescription>
                              {getClientName(period.clientId)} •{' '}
                              {
                                residents.find(r => r.id === period.residentId)
                                  ?.firstName
                              }{' '}
                              {
                                residents.find(r => r.id === period.residentId)
                                  ?.lastName
                              }
                            </CardDescription>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-bold'>
                            {formatCurrency(period.totalAmount)}
                          </div>
                          <div className='text-sm text-gray-600 dark:text-gray-400'>
                            {period.hoursProvided} hours
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='flex justify-between items-center'>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          Rate: {formatCurrency(period.hourlyRate)}/hour
                        </div>
                        <div className='flex gap-2'>
                          <Button size='sm' variant='outline'>
                            Edit
                          </Button>
                          <Button size='sm'>Generate Invoice</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='analytics' className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Revenue Trends</CardTitle>
                    <CardDescription>
                      Monthly revenue performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center py-8'>
                      <TrendingUp className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                      <p className='text-gray-500'>
                        Revenue chart would go here
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Top Clients</CardTitle>
                    <CardDescription>
                      Clients by revenue contribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {billingAnalytics?.topClients?.map(
                        (client: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                          >
                            <div>
                              <div className='font-medium'>
                                {client.clientName}
                              </div>
                              <div className='text-sm text-gray-600'>
                                {client.invoiceCount} invoices
                              </div>
                            </div>
                            <div className='text-right'>
                              <div className='font-bold'>
                                {formatCurrency(client.totalAmount)}
                              </div>
                            </div>
                          </div>
                        )
                      ) || (
                        <div className='text-center py-4'>
                          <Users className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                          <p className='text-gray-500'>
                            No client data available
                          </p>
                        </div>
                      )}
                    </div>
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
