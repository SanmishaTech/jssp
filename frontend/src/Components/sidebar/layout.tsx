import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role");
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <main className="pt-2 flex-1 overflow-auto">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
