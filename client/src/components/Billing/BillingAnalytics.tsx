import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface BillingAnalyticsProps {
  analytics: {
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
  } | undefined;
}

export function BillingAnalytics({ analytics }: BillingAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Loading analytics...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const monthlyData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: analytics.monthlyRevenue },
  ];

  const topClients = analytics.topClients.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Government Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClients.map((client) => (
              <div key={client.clientId} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{client.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.invoiceCount} invoices
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(client.totalAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { status: 'Paid', count: analytics.paidInvoices },
              { status: 'Pending', count: analytics.pendingInvoices },
              { status: 'Overdue', count: analytics.overdueInvoices },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(analytics.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Revenue</span>
              <span className="font-semibold">{formatCurrency(analytics.monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Outstanding Amount</span>
              <span className="font-semibold text-red-600">{formatCurrency(analytics.outstandingAmount)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Collection Rate</span>
                <span className="font-semibold">
                  {((analytics.paidInvoices / (analytics.paidInvoices + analytics.pendingInvoices + analytics.overdueInvoices)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}