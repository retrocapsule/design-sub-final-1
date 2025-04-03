'use client'; // Layout needs to be client component for hooks like usePathname

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from "react"; // Keep useState if needed for sheet state, though trigger manages it
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  Bell, 
  MessageSquare,
  FileText,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Package,
  Star,
  FileCheck,
  Database,
  Timer, 
  Check,
  Menu
} from "lucide-react";

// Reusable Sidebar Navigation Component within Layout
// Accept isInSheet prop
function SidebarNav({ isInSheet }: { isInSheet: boolean }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/requests", label: "Design Requests", icon: FileText },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/admin/messages", label: "Messages", icon: MessageSquare },
        { isDivider: true, label: "Content" },
        { href: "/admin/services", label: "Services", icon: Package },
        { href: "/admin/case-studies", label: "Case Studies", icon: FileCheck },
        { href: "/admin/testimonials", label: "Testimonials", icon: Star },
        { isDivider: true, label: "System" },
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/database", label: "Database", icon: Database },
        { href: "/admin/help", label: "Help & Support", icon: HelpCircle },
    ];

    // Function to check if a link is active (handles sub-routes like /admin/requests/[id])
    const isActive = (href: string) => {
         if (href === "/admin") {
             // Exact match for the main dashboard
             return pathname === href;
         }
         // StartsWith for sections with potential sub-routes
         return pathname.startsWith(href);
    }

    // Conditionally render SheetClose based on isInSheet prop
    const renderLink = (item: typeof navItems[0]) => (
         <Link
             href={item.href!}
             className={cn(
                 "w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm",
                 isActive(item.href!) ? "bg-primary text-primary-foreground" : "hover:bg-muted/50 text-foreground"
             )}
         >
             <item.icon className="h-4 w-4" />
             <span>{item.label}</span>
         </Link>
    );

    return (
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => 
                item.isDivider ? (
                    <div key={`divider-${index}`} className="pt-4 first:pt-0">
                         <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">{item.label}</h3>
                    </div>
                ) : (
                    // Apply SheetClose conditionally
                    isInSheet ? (
                        <SheetClose asChild key={item.href}> 
                           {renderLink(item)}
                         </SheetClose>
                    ) : (
                         <div key={item.href}>{renderLink(item)}</div> // Render Link directly for desktop
                    )
                )
            )}
        </nav>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // Basic Admin check - ideally middleware would handle this more robustly
    // For now, this prevents rendering the layout if not admin, but page components should also check
    // const { data: session, status } = useSession();
    // if (status === "loading") return <div>Loading session...</div>;
    // if (!session?.user || session.user.role !== "ADMIN") return redirect("/"); 
    // NOTE: Client-side checks in layout can cause flashes. Middleware is better.

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Desktop Side Menu - Pass isInSheet={false} */}
            <div className="w-64 bg-background border-r hidden md:flex md:flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Admin Panel</h2>
                </div>
                <SidebarNav isInSheet={false} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden"> {/* Allow content to scroll */}
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-[57px] items-center gap-1 border-b bg-background px-4 md:hidden"> 
                    {/* Mobile Menu Toggle */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col w-64 p-0">
                            <div className="p-4 border-b">
                                <h2 className="text-xl font-bold">Admin Panel</h2>
                            </div>
                            {/* Pass isInSheet={true} inside SheetContent */}
                            <SidebarNav isInSheet={true} /> 
                        </SheetContent>
                    </Sheet>
                    
                    {/* Potentially add mobile page title or breadcrumbs here if needed */}
                    <div className="flex-1 text-center">
                         <h1 className="font-semibold text-lg">Admin</h1>
                    </div>

                    {/* Right side icons (optional on mobile header) */}
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
                    </div>
                </header>

                {/* Page Content */} 
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children} { /* Render the specific page content here */ }
                </main>
            </div>
        </div>
    );
} 