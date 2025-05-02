import { SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role");
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <main className="pt-2 flex-1 overflow-auto">
        <div className="p-2">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
