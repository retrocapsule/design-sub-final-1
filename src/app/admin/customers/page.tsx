'use client';

import { CustomerManager } from "@/components/admin/customer-manager";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminCustomersPage() {
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
            <CustomerManager />
        </div>
    );
} 