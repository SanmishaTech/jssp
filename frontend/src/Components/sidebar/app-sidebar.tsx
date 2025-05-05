import React, { useState } from "react";
import {
  Calendar,
  Home,
  Building,
  BookText,
  BookOpen,
  Users,
  MessageCircle,
  UserCheck,
  Package,
  FileText,
  User,
  MapPin,
  PiggyBank,
  BookMarked,
  Grid,
  GraduationCap,
  Banknote,
  UsersRound,
  Landmark,
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
} from "@/Components/ui/sidebar";
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
} from "@/Components/ui/alert-dialog";
// Import DropdownMenu and Button components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ThemeSwitch } from "@/Components/theme-switch";

const roleBasedItems = {
  admin: [
    {
      title: "Dashboard",
      url: "/staffdashboard",
      icon: Home,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    },
    {
      title: "Academic Information",
      icon: BookOpen,
      children: [
        {
          title: "Subjects",
          url: "/subjects",
          icon: BookMarked,
        },
        {
          title: "Courses",
          url: "/courses",
          icon: BookText,
        },
        {
          title: "Semester",
          url: "/semester",
          icon: Calendar,
        },
        {
          title: "Room Number",
          url: "/rooms",
          icon: MapPin,
        },
        {
          title: "Division",
          url: "/divisions",
          icon: Grid,
        },
      ],
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
    {
      title: "Committees",
      url: "/committee",
      icon: UserCheck,
    },
    {
      title: "Meetings",
      url: "/meetings",
      icon: Users,
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Admissions",
      icon: BookOpen,
      children: [
        {
          title: "Admission Information",
          url: "/admissions",
          icon: BookText,
        },
        {
          title: "Cashiers",
          url: "/cashiers",
          icon: Banknote,
        },
       
        {
          title: "Students",
          url: "/students",
          icon: UsersRound,
        },
        {
          title: "CashBook",
          url: "/cashbook",
          icon: Landmark,
        },
        {
          title: "Scholarships",
          url: "/scholarships",
          icon: GraduationCap,
        },
      ],
    },
    {
      title: "Bank",
      icon: BookOpen,
      children: [
        {
          title: "Bank Accounts",
          url: "/bankaccounts",
          icon: BookText,
        },
        {
          title: "Bank",
          url: "/bank",
          icon: BookText,
        },
       
         
      
      ],
    },
  ],
  superadmin: [
    {
      title: "Dashboard",
      url: "/rootdashboard",
      icon: Home,
    },
    {
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    },
    {
      title: "Trustees",
      url: "/trusties",
      icon: User,
    },
    {
      title: "Institutes",
      url: "/institutes",
      icon: Building,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
  ],
  member: [
    {
      title: "Dashboard",
      url: "/memberdashboard",
      icon: Home,
    },
    {
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },

    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
  ],
};

export function AppSidebar({ role, userAvatar }) {
  const items = roleBasedItems[role] || [];

  // Manage open state for items with dropdown children
  const [openDropdowns, setOpenDropdowns] = useState({});
  // State to control the AlertDialog in the logo dropdown
  const [openLogoAlert, setOpenLogoAlert] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Logout function – replace with your actual logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out Successfully");
    navigate({ to: "/" });
    console.log("User logged out");
    // e.g., clear tokens, call signOut(), or redirect to login
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        {/* Header area with logo and theme switch */}
        <div className="flex flex-col space-y-3">
          {/* Logo and dropdown */}
          <div className="flex items-center justify-between p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <img src={background} alt="Logo" className="w-7 h-7" />
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
            
            {/* Theme Switch - Always visible */}
            <ThemeSwitch />
          </div>
          
          {/* Divider */}
          <div className="h-px bg-border mx-4" />
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
                          <item.icon className="mr-2 text-gray-600 dark:text-blue-300" />
                          <span>{item.title}</span>
                          {/* Dropdown arrow indicator */}
                          <svg
                            className={`ml-auto transition-transform duration-200 text-gray-500 dark:text-blue-200 ${
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
                                <child.icon className="mr-2 text-gray-600 dark:text-blue-300" />
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
                        <item.icon className="mr-2 text-gray-600 dark:text-blue-300" />
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
