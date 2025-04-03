'use client';

import { PaymentDetail } from "@/components/admin/payment-detail";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface AdminPaymentDetailPageProps {
  params: {
    paymentId: string;
  };
}

export default function AdminPaymentDetailPage({ params }: AdminPaymentDetailPageProps) {
  const { paymentId } = params;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center items-center h-64">Loading session...</div>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    if (typeof window !== 'undefined') { redirect("/"); }
    return null;
  }

  return (
    <div>
      <PaymentDetail paymentId={paymentId} />
    </div>
  );
} 