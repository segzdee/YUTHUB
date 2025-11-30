import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Users,
  Building2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price: number;
  billingPeriod: string;
  maxResidents: number;
  maxProperties: number;
  features: string[];
}

interface UsageMetrics {
  currentResidents: number;
  currentProperties: number;
  storageUsed: number;
  storageLimit: number;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  date: string;
  dueDate: string;
  pdfUrl: string;
}

export default function SettingsBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: loadingSubscription } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription/current"],
    enabled: !!user,
  });

  const { data: usage, isLoading: loadingUsage } = useQuery<UsageMetrics>({
    queryKey: ["/api/subscription/usage"],
    enabled: !!user,
  });

  const { data: paymentMethod, isLoading: loadingPayment } = useQuery<PaymentMethod>({
    queryKey: ["/api/subscription/payment-method"],
    enabled: !!user,
  });

  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/subscription/invoices"],
    enabled: !!user,
  });

  const createPortalSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create portal session");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const upgradePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to initiate upgrade");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate upgrade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleManagePayment = () => {
    createPortalSessionMutation.mutate();
  };

  const handleUpgrade = () => {
    upgradePlanMutation.mutate();
  };

  const isLoading = loadingSubscription || loadingUsage || loadingPayment || loadingInvoices;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const residentUsage = usage ? (usage.currentResidents / subscription!.maxResidents) * 100 : 0;
  const propertyUsage = usage ? (usage.currentProperties / subscription!.maxProperties) * 100 : 0;
  const storageUsage = usage ? (usage.storageUsed / usage.storageLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Plan
              <Badge variant={subscription?.tier === "free" ? "secondary" : "default"}>
                {subscription?.tier.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>Your active subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold">£{subscription?.price}</span>
                <span className="text-sm text-muted-foreground">
                  /{subscription?.billingPeriod}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{subscription?.name}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Features included:</p>
              <ul className="space-y-1">
                {subscription?.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {subscription?.tier !== "enterprise" && (
              <Button
                className="w-full"
                onClick={handleUpgrade}
                disabled={upgradePlanMutation.isPending}
              >
                {upgradePlanMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Your default payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethod ? (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{paymentMethod.brand} •••• {paymentMethod.last4}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next invoice date</span>
                    <span className="font-medium">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">£{subscription?.price}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No payment method on file</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleManagePayment}
              disabled={createPortalSessionMutation.isPending}
            >
              {createPortalSessionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {paymentMethod ? "Update Payment Method" : "Add Payment Method"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Metrics
          </CardTitle>
          <CardDescription>Your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Residents
              </span>
              <span className="font-medium">
                {usage?.currentResidents} / {subscription?.maxResidents}
              </span>
            </div>
            <Progress value={residentUsage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Properties
              </span>
              <span className="font-medium">
                {usage?.currentProperties} / {subscription?.maxProperties}
              </span>
            </div>
            <Progress value={propertyUsage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Storage
              </span>
              <span className="font-medium">
                {usage?.storageUsed}GB / {usage?.storageLimit}GB
              </span>
            </div>
            <Progress value={storageUsage} className="h-2" />
          </div>

          {(residentUsage > 80 || propertyUsage > 80 || storageUsage > 80) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                You're approaching your plan limits. Consider upgrading to avoid service interruptions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">£{invoice.amount.toFixed(2)}</p>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={invoice.pdfUrl} download>
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No invoices available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
