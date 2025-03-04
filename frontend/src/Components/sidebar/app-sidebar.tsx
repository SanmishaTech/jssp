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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// Import AlertDialog components from shadcn
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
// Import DropdownMenu and Button components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const roleBasedItems = {
  admin: [
    {
      title: "Staff",
      url: "/staff",
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
      title: "Complaints",
      url: "/complaints",
      icon: Users,
    },
    {
      title: "Committees",
      url: "/committee",
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
  ],
  member: [
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
      title: "Calender",
      url: "",
      icon: Building,
    },
    {
      title: "Leave Application",
      url: "",
      icon: Building,
    },
  ],
};

export function AppSidebar({ role, userAvatar }) {
  const items = roleBasedItems[role] || [];

  // Manage open state for items with dropdown children
  const [openDropdowns, setOpenDropdowns] = useState({});
  // State to control the AlertDialog in the logo dropdown
  const [openLogoAlert, setOpenLogoAlert] = useState(false);

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Logout function – replace with your actual logout logic
  const handleLogout = () => {
    console.log("User logged out");
    // e.g., clear tokens, call signOut(), or redirect to login
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        {/* Always visible logo container */}
        <div className="flex items-center p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <img src={background} alt="Logo" className="w-6 h-6" />
                {/* Optionally show text on larger screens */}
                <span className="ml-2 hidden md:inline">JEEVANDEEP</span>
              </div>
            </DropdownMenuTrigger>
            {/* Dropdown content positioned relative to the trigger */}
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Wrap the Logout item in an AlertDialog for confirmation */}
              <AlertDialog open={openLogoAlert} onOpenChange={setOpenLogoAlert}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Logout
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be logged out from your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpenLogoAlert(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Logout
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Sidebar navigation items */}
        <SidebarGroup>
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
                    {/* Render nested items if dropdown is open */}
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
