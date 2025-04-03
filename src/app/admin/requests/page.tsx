'use client'; // Keep this client for potential future client-side interactions if needed

import { DesignRequestManager } from "@/components/admin/design-request-manager";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminRequestsPage() {
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
            {/* Title could be handled by layout or added here if needed */}
            {/* <h1 className="text-3xl font-bold mb-8">Design Requests</h1> */}
            <DesignRequestManager />
        </div>
    );
} 