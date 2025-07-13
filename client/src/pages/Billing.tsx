import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  FileText, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import { GovernmentClientsTab } from '@/components/Billing/GovernmentClientsTab';
import { InvoicesTab } from '@/components/Billing/InvoicesTab';
import { BillingPeriodsTab } from '@/components/Billing/BillingPeriodsTab';
import { SupportLevelRatesTab } from '@/components/Billing/SupportLevelRatesTab';
import { BillingAnalytics } from '@/components/Billing/BillingAnalytics';

interface BillingAnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  topClients: Array<{
    clientId: number;
    clientName: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
}

export default function Billing() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<BillingAnalyticsData>({
    queryKey: ['/api/billing/analytics'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (analyticsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Government Billing
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage invoicing and billing for government clients
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.monthlyRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.outstandingAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs">{analytics?.paidInvoices || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs">{analytics?.pendingInvoices || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs">{analytics?.overdueInvoices || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs sm:text-sm">Clients</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm">Invoices</TabsTrigger>
            <TabsTrigger value="periods" className="text-xs sm:text-sm">Periods</TabsTrigger>
            <TabsTrigger value="rates" className="text-xs sm:text-sm">Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BillingAnalytics analytics={analytics} />
          </TabsContent>

          <TabsContent value="clients">
            <GovernmentClientsTab />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesTab />
          </TabsContent>

          <TabsContent value="periods">
            <BillingPeriodsTab />
          </TabsContent>

          <TabsContent value="rates">
            <SupportLevelRatesTab />
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}