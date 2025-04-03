import { Navigation } from "@/components/layout/navigation";
import { ResponsiveSidebar } from "@/components/dashboard/responsive-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex flex-1">
        {/* Sidebar - visible on desktop, hidden on mobile */}
        <aside className="fixed h-[calc(100vh-4rem)] w-64 hidden md:block border-r z-30">
          <ResponsiveSidebar />
        </aside>
        
        {/* Mobile sidebar toggle - appears on mobile only */}
        <div className="fixed top-[4rem] left-4 z-40 md:hidden">
          <ResponsiveSidebar />
        </div>
        
        {/* Main content area - full width on mobile, adjusted on desktop */}
        <main className="flex-1 p-4 md:p-8 md:ml-64">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 