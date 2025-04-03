'use client';

import { useParams } from 'next/navigation';
import { CustomerDetail } from '@/components/admin/customer-detail';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AdminCustomerDetailPage() {
    const params = useParams();
    const userId = params.userId as string;
    
    // Basic Admin check - redundant if layout/middleware covers, but good practice
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
            <CustomerDetail userId={userId} />
        </div>
    );
} 