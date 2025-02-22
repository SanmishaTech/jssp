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
import background from "../../images/Jeevandeep-logo.jpeg";
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
      url: "#",
      icon: BookText,
    },
    {
      title: "Division",
      url: "#",
      icon: BookText,
    },
    {
      title: "Rooms",
      url: "#",
      icon: BookText,
    },
    {
      title: "Commities",
      url: "#",
      icon: BookText,
    },
    {
      title: "Attendence Tracking",
      url: "#",
      icon: BookText,
    },
  ],
  superadmin: [
    {
      title: "Trustees",
      url: "/trusties",
      icon: Users,
    },
    {
      title: "Institutes",
      url: "/institutes",
      icon: Building,
    },
    {
      title: "Complaints",
      url: "#",
      icon: Building,
    },
    {
      title: "Institutes Calender",
      url: "#",
      icon: Building,
    },

    {
      title: "Reports and Analytics",
      url: "#",
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
          <SidebarGroupLabel>
            {" "}
            <div className="flex items-center">
              <img src={background} alt="Logo" className="w-6 h-6 mr-2" />
              <span>JEEVANDEEP</span>
            </div>
          </SidebarGroupLabel>
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
