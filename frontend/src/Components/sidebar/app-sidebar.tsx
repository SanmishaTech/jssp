import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar";
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
  BookMarked,
  Banknote,
  UsersRound,
  Landmark,
  GraduationCap,
  Grid,
  LogOut,
  Truck
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import background from "../../images/Jeevandeep-logo.jpeg";

// Define TypeScript interfaces for our components
interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
  className?: string;
}

interface AppSidebarProps {
  role: string;
}

interface UserData {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
}

const roleBasedItems: Record<string, MenuItem[]> = {
  superadmin: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Leave Approval",
      url: "/leaveapproval",
      icon: FileText,
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
  viceprincipal: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Time Table",
      url: "/teachertimetable",
      icon: BookText,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: BookText,
    },
    {
      title: "Holidays",
      icon: Calendar,
      children: [
        {
          title: "Regular Holidays",
          url: "/holiday",
          icon: BookText,
        },
        {
          title: "Weekly Holidays",
          url: "/weeklyholiday",
          icon: BookText,
        }
      ]
    },
    {
      title: "Staff Management",
      icon: Users,
      children: [
        {
          title: "Staff Directory",
          url: "/staff",
          icon: Users,
        },
        {
          title: "Leave Approval",
          url: "/leaveapproval",
          icon: FileText,
        }
      ]
    },
    {
      title: "Calendar",
      url: "/calender",
      icon: Calendar,
    },
    {
      title: "Academic Oversight",
      icon: BookOpen,
      children: [
        {
          title: "Courses",
          url: "/courses",
          icon: BookText,
        },
        {
          title: "Subjects",
          url: "/subjects",
          icon: BookMarked,
        },
        {
          title: "Divisions",
          url: "/divisions",
          icon: Grid,
        }
      ]
    },
    {
      title: "Student Affairs",
      icon: UsersRound,
      children: [
        {
          title: "Students",
          url: "/students",
          icon: UsersRound,
        },
        {
          title: "Complaints",
          url: "/complaints",
          icon: MessageCircle,
        }
      ]
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
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Time Table",
      url: "/teachertimetable",
      icon: BookText,
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: Truck,
    },
    {
      title: "Asset Masters",
      url: "/assetmasters",
      icon: Truck,
    },
    {
      title: "Requisitions",
      url: "/requisitions",
      icon: Truck,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: BookText,
    },
    {
      title: "Holidays",
      icon: Calendar,
      children: [
        {
          title: "Regular Holidays",
          url: "/holiday",
          icon: BookText,
        },
        {
          title: "Weekly Holidays",
          url: "/weeklyholiday",
          icon: BookText,
        }
      ]
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
          title: "Subjects",
          url: "/subjects",
          icon: BookMarked,
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
      title: "Leave Approval",
      url: "/leaveapproval",
      icon: FileText,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
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
  
  member: [
    {
      title: "Dashboard",
      url: "/dashboards",
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
  cashier: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
   
    {
      title: "Cashier",
      url: "/cashiers",
      icon: Banknote,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
    
  ],
  accountant: [
    
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
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
    {
      title: "Cashier",
      url: "/cashiers",
      icon: Banknote,
    },
   
    {
      title: "CashBook",
      url: "/cashbook",
      icon: Landmark,
    },
   
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
     
  ],
  backoffice: [
    
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Home,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
    {
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    }, 
  ],
  admission: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
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
          title: "Subjects",
          url: "/subjects",
          icon: BookMarked,
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
        {
          title: "Students",
          url: "/students",
          icon: UsersRound,
        },
        
       
      ],
      
    },
    {
      title: "Admission Information",
      url: "/admissions",
      icon: BookText,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
     
  ],
  teachingstaff: [
    
    {
      title: "Dashboard",
      url: "/dashboards",
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
      icon: Home,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
    
    {
      title: "Set Teaching Plan",
      icon: BookOpen,
      children: [
        {
          title: "Subject Hour Allocation",
          url: "/subjecthours",
          icon: BookMarked,
        },
       
        {
          title: "Time Table",
          url: "/teachertimetable",
          icon: BookText,
        },
     
       
      ],
    },
 
    
  ],
  nonteachingstaff: [
    
    {
      title: "Dashboard",
      url: "/dashboards",
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
      icon: Home,
    },
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
   
  ],
};

export function AppSidebar({ role }: AppSidebarProps) {
  const items = roleBasedItems[role] || [];
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Get user data from localStorage
  const [userData, setUserData] = useState<UserData>({
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
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  // State to control the AlertDialog in the logo dropdown
  const [openLogoAlert, setOpenLogoAlert] = useState(false);
  // State for profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  // Handle click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownOpen &&
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node) &&
        profileTriggerRef.current &&
        !profileTriggerRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  useEffect(() => {
    items.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          child.url && currentPath.startsWith(child.url)
        );
        if (hasActiveChild) {
          setOpenDropdowns(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [currentPath]);

  const toggleDropdown = (title: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Logout function – replace with your actual logout logic
  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged Out Successfully');
    navigate({ to: '/' });
  };

  const handleUpdateProfile = () => {
    navigate({ to: '/profiles' });
    setProfileDropdownOpen(false);
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <img src={background} alt="Logo" className="w-7 h-7" />
                  <span className="ml-2 hidden md:inline">JEEVANDEEP</span>
                </div>
              </DropdownMenuTrigger>
            </DropdownMenu>
            
          </div>
          <div className="h-px bg-border mx-4" />
        </div>
        <div className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item: MenuItem) =>
                  item.children ? (
                    <div key={item.title}>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={() => toggleDropdown(item.title)}
                            className={`flex items-center w-full ${item.children?.some(child => child.url && currentPath.startsWith(child.url)) ? "bg-blue-100 text-blue-600" : ""}`}
                          >
                            <item.icon className="mr-2 text-gray-600 dark:text-blue-300" />
                            <span>{item.title}</span>
                            <svg
                              className={`ml-auto transition-transform duration-200 text-gray-500 dark:text-blue-200 ${
                                openDropdowns[item.title] ? 'rotate-90' : ''
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
                      {openDropdowns[item.title] && (
                        <div className="ml-4">
                          {item.children.map((child: MenuItem) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton asChild>
                                <a href={child.url} className={`flex items-center ${child.url && currentPath.startsWith(child.url) ? "bg-blue-100 text-blue-600" : ""}`}>
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
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className={`flex items-center ${item.url && currentPath === item.url ? "bg-blue-100 text-blue-600" : ""}`}>
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
        </div>
        <div className="border-t border-border bg-sidebar dark:bg-slate-800 p-2 sticky bottom-0 mt-auto z-10">
          <div 
            ref={profileTriggerRef}
            className="flex items-center gap-3 cursor-pointer hover:bg-accent/20 rounded-md p-1"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-label="Toggle profile menu"
          >
            <div className="relative h-9 w-9 rounded-full bg-primary/10">
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
            <div className="flex-1 overflow-hidden">
              <div className="font-medium truncate">{userData.userName}</div>
              <div className="text-xs text-muted-foreground truncate">
                {userData.userEmail}
              </div>
            </div>
            <div
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent/50"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
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
          </div>
        </div>
      </SidebarContent>
      {profileDropdownOpen && (
        <div
          ref={profileDropdownRef}
          className="fixed left-[calc(var(--sidebar-width)_+_8px)] bottom-16 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none z-50 animate-in fade-in-0 zoom-in-95"
          style={{ transform: 'translateX(0)' }}
        >
          <div className="font-normal px-2 py-1.5 text-sm">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userData.userName}</p>
              <p className="text-xs text-muted-foreground">{userData.userEmail}</p>
            </div>
          </div>
          <div className="h-px bg-muted my-1" />
          {(role === 'member' || role === 'teachingstaff' || role === 'cashier' || role === 'backoffice' || role === 'accountant' || role === 'admission' || role === 'admin') && (
            <button
              onClick={handleUpdateProfile}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Update Profile</span>
            </button>
          )}
          <button
            onClick={() => setOpenLogoAlert(true)}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
      <AlertDialog open={openLogoAlert} onOpenChange={setOpenLogoAlert}>
        <AlertDialogContent className="bg-white">
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
    </Sidebar>
  );
}

export default AppSidebar;
