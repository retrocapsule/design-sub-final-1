'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Receipt } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  price: number;
  interval: 'monthly' | 'yearly';
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function BillingPage() {
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [invoicesLoading, setInvoicesLoading] = React.useState(true);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = React.useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [updatingPayment, setUpdatingPayment] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subscriptionRes, invoicesRes, paymentMethodsRes] = await Promise.all([
          fetch('/api/billing/subscription'),
          fetch('/api/billing/invoices'),
          fetch('/api/billing/payment-method'),
        ]);

        // Handle subscription data
        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setSubscription(subscriptionData);
        } else if (subscriptionRes.status === 401) {
          // User is not authenticated
          router.push('/signin');
        }
        setSubscriptionLoading(false);

        // Handle invoices data
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData);
        }
        setInvoicesLoading(false);

        // Handle payment methods data
        if (paymentMethodsRes.ok) {
          const paymentMethodsData = await paymentMethodsRes.json();
          setPaymentMethods(paymentMethodsData);
        }
        setPaymentMethodsLoading(false);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
      toast.success('Subscription cancelled successfully');
      setCancelDialogOpen(false);
    } catch (err) {
      toast.error('Failed to cancel subscription');
      console.error('Error cancelling subscription:', err);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setUpdatingPayment(true);
      const response = await fetch('/api/billing/payment-method', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      toast.error('Failed to update payment method');
      console.error('Error updating payment method:', err);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }

      const { downloadUrl } = await response.json();
      window.open(downloadUrl, '_blank');
    } catch (err) {
      toast.error('Failed to download invoice');
      console.error('Error downloading invoice:', err);
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Billing"
        description="Manage your subscription and billing"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{subscription.plan} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      ${subscription.price}/{subscription.interval}
                    </p>
                  </div>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current period ends on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="text-sm text-yellow-600">
                    Your subscription will be cancelled at the end of the billing period
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleUpdatePaymentMethod}
                    disabled={updatingPayment}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  {!subscription.cancelAtPeriodEnd && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Button onClick={() => router.push('/pricing')}>Choose a Plan</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethodsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-200 rounded" />
                    <div>
                      <p className="font-medium">•••• {method.last4}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payment methods added</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">${invoice.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 