import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Building,
  BookText,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Define role-based menu items
const roleBasedItems = {
  admin: [
    {
      title: "Staff",
      url: "/members",
      icon: Users,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: BookText,
    },
  ],
  superadmin: [
    // {
    //   title: "trusties",
    //   url: "/trusties",
    //   icon: Users,
    // },
    {
      title: "Institutes",
      url: "/institutes",
      icon: Building,
    },
  ],
};

export function AppSidebar({ role }) {
  const items = roleBasedItems[role] || []; // Fallback to an empty array if the role doesn't exist

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
