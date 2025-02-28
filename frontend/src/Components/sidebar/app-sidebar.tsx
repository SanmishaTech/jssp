import React, { useState } from "react";
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

// Define role-based menu items with nested Academic Years for admins
const roleBasedItems = {
  admin: [
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: Users,
    },
    {
      title: "Academic Information",
      icon: Calendar,
      children: [
        {
          title: "Courses",
          url: "/courses",
          icon: BookText,
        },
        {
          title: "Semester",
          url: "/semester",
          icon: BookText,
        },

        {
          title: "Room Number",
          url: "/rooms",
          icon: BookText,
        },
        {
          title: "Division",
          url: "/divisions",
          icon: BookText,
        },
      ],
    },
    {
      title: "Committees",
      url: "/committee",
      icon: BookText,
    },
    {
      title: "Attendance Tracking",
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
      title: "Inventory",
      url: "/inventory",
      icon: Building,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: Building,
    },
    {
      title: "Institutes Calender",
      url: "",
      icon: Building,
    },
    {
      title: "Reports and Analytics",
      url: "",
      icon: Building,
    },
  ],
};

export function AppSidebar({ role }) {
  const items = roleBasedItems[role] || [];

  // Manage open state for items with dropdown children
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center">
              <img src={background} alt="Logo" className="w-6 h-6 mr-2" />
              <span>JEEVANDEEP</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
                item.children ? (
                  // Render dropdown parent for items with children
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => toggleDropdown(item.title)}
                          className="flex items-center w-full"
                        >
                          <item.icon className="mr-2" />
                          <span>{item.title}</span>
                          {/* Dropdown arrow indicator */}
                          <svg
                            className={`ml-auto transition-transform duration-200 ${
                              openDropdowns[item.title] ? "rotate-90" : ""
                            }`}
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <path d="M7 10l5 5 5-5z" />
                          </svg>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* Conditionally render nested items */}
                    {openDropdowns[item.title] && (
                      <div className="ml-4">
                        {item.children.map((child) => (
                          <SidebarMenuItem key={child.title}>
                            <SidebarMenuButton asChild>
                              <a href={child.url} className="flex items-center">
                                <child.icon className="mr-2" />
                                <span>{child.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Render regular menu items
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center">
                        <item.icon className="mr-2" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
