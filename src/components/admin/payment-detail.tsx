'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ChevronLeft, 
  User, 
  RefreshCw,
  Wallet, 
  CircleDollarSign, 
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPaymentById, processRefund, addAccountCredit } from "@/services/payment-service";
import type { PaymentWithUser } from "@/services/payment-service";

interface PaymentDetailProps {
  paymentId: string;
}

export function PaymentDetail({ paymentId }: PaymentDetailProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundType, setRefundType] = useState("full");
  const [creditAmount, setCreditAmount] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  async function fetchPaymentDetails() {
    setIsLoading(true);
    try {
      const data = await getPaymentById(paymentId);
      setPayment(data);
      
      // Set initial refund amount to full payment amount
      if (data) {
        const remainingAmount = data.amount - (data.refundedAmount || 0);
        setRefundAmount((remainingAmount / 100).toFixed(2));
      }
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast.error("Failed to load payment details");
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(amount: number | null | undefined) {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  }

  function formatDate(date: Date | string) {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  }

  function getRemainingRefundableAmount() {
    if (!payment) return 0;
    return payment.amount - (payment.refundedAmount || 0);
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      case "partially_refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  async function handleRefund() {
    if (!payment) return;

    setIsProcessing(true);
    try {
      const isFullRefund = refundType === "full";
      const amount = isFullRefund 
        ? getRemainingRefundableAmount() 
        : parseFloat(refundAmount) * 100;

      if (!isFullRefund && (isNaN(amount) || amount <= 0)) {
        toast.error("Please enter a valid refund amount");
        return;
      }

      if (!isFullRefund && amount > getRemainingRefundableAmount()) {
        toast.error("Refund amount cannot exceed the remaining payment amount");
        return;
      }

      await processRefund(paymentId, amount, isFullRefund);
      
      toast.success("Refund processed successfully");
      setIsRefundDialogOpen(false);
      fetchPaymentDetails();
    } catch (error) {
      console.error("Failed to process refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAddCredit() {
    if (!payment) return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(creditAmount) * 100;

      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid credit amount");
        return;
      }

      await addAccountCredit(payment.user.id, paymentId, amount);
      
      toast.success("Account credit added successfully");
      setIsCreditDialogOpen(false);
      fetchPaymentDetails();
    } catch (error) {
      console.error("Failed to add account credit:", error);
      toast.error("Failed to add account credit");
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Payment not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/payments")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/payments")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <h2 className="text-3xl font-bold tracking-tight mt-2">
            Payment Details
          </h2>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={payment.status === "refunded" || getRemainingRefundableAmount() <= 0}>
                Process Refund
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogDescription>
                  Refund this payment partially or in full to the customer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <RadioGroup
                  value={refundType}
                  onValueChange={setRefundType}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Full Refund ({formatCurrency(getRemainingRefundableAmount())})</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial">Partial Refund</Label>
                  </div>
                </RadioGroup>

                {refundType === "partial" && (
                  <div className="space-y-2">
                    <Label htmlFor="refundAmount">Refund Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="refundAmount"
                        type="number"
                        min="0.01"
                        max={(getRemainingRefundableAmount() / 100).toFixed(2)}
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maximum: {formatCurrency(getRemainingRefundableAmount())}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRefund} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Process Refund"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                Add Account Credit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Account Credit</DialogTitle>
                <DialogDescription>
                  Add credit to the customer&apos;s account balance.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="creditAmount">Credit Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="creditAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCredit} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Add Credit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Details about this payment transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-sm">{payment.id}</span>
            </div>
            {payment.paymentIntentId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Intent ID</span>
                <span className="font-mono text-sm">{payment.paymentIntentId}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(payment.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className={getStatusBadgeColor(payment.status)}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1).replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            {payment.refundedAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Refunded Amount</span>
                <span>{formatCurrency(payment.refundedAmount)}</span>
              </div>
            )}
            {payment.creditAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credit Amount</span>
                <span>{formatCurrency(payment.creditAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span>{payment.currency.toUpperCase()}</span>
            </div>
            {payment.description && (
              <div className="border-t pt-4 mt-4">
                <span className="text-muted-foreground block mb-2">Description</span>
                <p>{payment.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Details about the customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <User className="h-10 w-10 rounded-full bg-muted p-2" />
              <div>
                <div className="font-medium">{payment.user.name || "No name"}</div>
                <div className="text-sm text-muted-foreground">{payment.user.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-muted-foreground">Customer ID</span>
              <span className="font-mono text-sm">{payment.user.id}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push(`/admin/customers/${payment.user.id}`)}
            >
              View Customer Details
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>History of events related to this payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>Payment Created</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                </TableRow>
                {payment.updatedAt.toString() !== payment.createdAt.toString() && (
                  <TableRow>
                    <TableCell>{formatDate(payment.updatedAt)}</TableCell>
                    <TableCell>Payment Updated</TableCell>
                    <TableCell>
                      {payment.refundedAmount ? `Refunded: ${formatCurrency(payment.refundedAmount)}` : ""}
                      {payment.creditAmount ? `Credit: ${formatCurrency(payment.creditAmount)}` : ""}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 