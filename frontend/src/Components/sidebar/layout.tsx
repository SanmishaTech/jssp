import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CommandMenu } from "../ui/CommandMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role") || '';
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <main className="min-w-0 flex-1 overflow-auto pt-2">
        <div className="p-2 flex items-center justify-between">
          <SidebarTrigger />
          <CommandMenu role={role} />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
