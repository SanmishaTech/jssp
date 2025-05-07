import React, { useState, useEffect } from "react";
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
  LogOut,
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
          title: "Acadamic Year",
          url: "/academicyears",
          icon: BookMarked,
        },
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

export function AppSidebar({ role }) {
  const items = roleBasedItems[role] || [];
  
  // Get user data from localStorage
  const [userData, setUserData] = useState({
    userName: "User Name", 
    userEmail: "user@example.com",
    userAvatar: null
  });
  
  // Load user data from localStorage on component mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData({
          userName: user.name || "User Name",
          userEmail: user.email || "user@example.com",
          userAvatar: null // Set avatar if available in your user object
        });
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  // Manage open state for items with dropdown children
  const [openDropdowns, setOpenDropdowns] = useState({});
  // State to control the AlertDialog in the logo dropdown
  const [openLogoAlert, setOpenLogoAlert] = useState(false);
  // State for profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Logout function – replace with your actual logout logic
  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    toast.success("Logged Out Successfully");
    navigate({ to: "/" });
     // e.g., clear tokens, call signOut(), or redirect to login
  };

  // Profile navigation function
  const handleUpdateProfile = () => {
    navigate({ to: "/profiles" });
    setProfileDropdownOpen(false);
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
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
              {/* <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
              </DropdownMenuContent> */}
            </DropdownMenu>
            
            {/* Theme Switch - Always visible */}
            <ThemeSwitch />
          </div>
          
          {/* Divider */}
          <div className="h-px bg-border mx-4" />
        </div>
        
        {/* Sidebar navigation items - using flex-1 to allow it to expand */}
        <SidebarGroup className="flex-1">
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
        
        {/* Profile button section at bottom */}
        <div className="mt-auto border-t border-border p-2">
          <DropdownMenu open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-md  hover:bg-accent hover:text-accent-foreground transition-colors data-[collapsed=true]:justify-start data-[collapsed=true]:pl-0">
                {/* Profile section that adapts to collapsed state */}
                <div className="flex w-full items-center gap-3 data-[collapsed=true]:justify-start">
                  {/* Avatar - Always visible */}
                  <div className="relative flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 data-[collapsed=true]:mr-5">
                    {userData.userAvatar ? (
                      <img 
                        src={userData.userAvatar} 
                        alt={userData.userName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                  </div>
                  
                  {/* User info - Hidden when collapsed */}
                  <div className="flex-1 overflow-hidden data-[collapsed=true]:hidden">
                    <div className="font-medium truncate">{userData.userName}</div>
                    <div className="text-xs text-muted-foreground truncate">{userData.userEmail}</div>
                  </div>

                  {/* Dropdown chevron - Hidden when collapsed */}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform data-[collapsed=true]:hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              side="right" 
              sideOffset={5}
              alignOffset={30} 
              className="w-56 animate-in slide-in-from-bottom-5 duration-200 origin-top-right data-[side=right]:animate-in data-[side=right]:slide-in-from-left-5"
              avoidCollisions={true}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userData.userName}</p>
                  <p className="text-xs text-muted-foreground">{userData.userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {role === "member" && (
                <DropdownMenuItem onClick={handleUpdateProfile} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Update Profile</span>
                </DropdownMenuItem>
              )}
              
              <AlertDialog open={openLogoAlert} onOpenChange={setOpenLogoAlert}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Log out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

// Add a default export for the component
export default AppSidebar;
