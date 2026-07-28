import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CommandMenu } from "../ui/CommandMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role") || '';
  return (
    <SidebarProvider className="h-svh max-h-svh overflow-hidden">
      <AppSidebar role={role} />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-2">
        <div className="flex items-center justify-between p-2">
          <SidebarTrigger />
          <CommandMenu role={role} />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
