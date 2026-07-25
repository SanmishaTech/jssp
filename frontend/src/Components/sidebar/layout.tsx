import { useLocation } from "@tanstack/react-router";
import { SidebarProvider, useSidebar, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";

function LayoutContent({ children, role, isNoticePage }: { children: React.ReactNode, role: string, isNoticePage: boolean }) {
  const { isMobile } = useSidebar();

  return (
    <>
      <AppSidebar role={role} />
      <div className="flex flex-col flex-1 h-full min-h-screen overflow-hidden">
        {/* Mobile top bar */}
        {isMobile && (
          <header className="flex items-center px-4 py-2 border-b bg-white gap-3 z-20 flex-shrink-0">
            <SidebarTrigger className="h-[28px] w-[28px] text-muted-foreground hover:text-foreground [&_svg]:h-[18px] [&_svg]:w-[18px]" />
            <span className="font-bold text-sm tracking-wide">JEEVANDEEP</span>
          </header>
        )}
        <main className={`pt-2 flex-1 ${isNoticePage ? "overflow-hidden h-full flex flex-col" : "overflow-auto"}`}>
          {children}
        </main>
      </div>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role") || '';
  const location = useLocation();
  const isNoticePage = location.pathname.toLowerCase().includes('/notice');

  return (
    <SidebarProvider>
      <LayoutContent role={role} isNoticePage={isNoticePage}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}
