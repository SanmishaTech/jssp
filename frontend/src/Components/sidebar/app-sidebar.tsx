import React, { useState, useEffect, useRef, useMemo } from "react";
import { useGetData } from "@/Components/HTTP/GET"; // fetch helper
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { NotificationPopover } from "../ui/notification-popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar";
import { User, LogOut, Search, UserCheck, CalendarClock } from "lucide-react";
import { CommandMenu } from "../ui/CommandMenu";
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
import { searchconfig, MenuItem } from "../ui/searchconfig";

interface Committee {
  id: number;
  commitee_name: string;
}

interface AppSidebarProps {
  role: string;
}

interface UserData {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
}


export function AppSidebar({ role }: AppSidebarProps) {
  const pathMatches = (path: string, url?: string) => {
    if (!url) return false;
    return path === url || path.startsWith(url + "/");
  };
  // Fetch committees list – used to dynamically populate sidebar under Staff Management
  const committeeQuery = useGetData({
    endpoint: "/api/all_committee",
    params: { queryKey: ["committees"] },
  });

  // Extract committees once query succeeds (useGetData returns parsed JSON per project convention)
  const committeesRaw: Committee[] = useMemo(() => {
    if (committeeQuery.data && (committeeQuery.data as any).data?.Commitee) {
      return (committeeQuery.data as any).data.Commitee as Committee[];
    }
    return [];
  }, [committeeQuery.data]);

  // Read logged-in staff id (if available)
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const loggedStaffId = useMemo(() => {
    if (!userStr) return null;
    try {
      const u = JSON.parse(userStr);
      return u.staff_id || u.id || null;
    } catch {
      return null;
    }
  }, [userStr]);

  // Filter committees: admins/VP see all, others only committees they belong to (requires backend to include staff array)
  const committees: Committee[] = useMemo(() => {
    if (role === 'admin' || role === 'viceprincipal') return committeesRaw;
    return committeesRaw.filter((c: any) => {
      if (!c.staff || !Array.isArray(c.staff)) return false;
      return c.staff.some((s: any) => s.staff_id === loggedStaffId);
    });
  }, [committeesRaw, role, loggedStaffId]);
  // Base items from static config
const baseItems = useMemo(() => searchconfig[role as keyof typeof searchconfig] || [], [role]);

// Inject dynamic "Added Committees" dropdown at root level
const items = useMemo(() => {
  if (!committees.length) return baseItems;

  // Deep-clone base items so we don't mutate state memo value
  const newItems: MenuItem[] = baseItems.map((it) => ({ ...it, children: it.children ? it.children.map(c => ({ ...c })) : undefined }));

  // Remove any existing "Created Committees" to avoid duplicates
  const existingIdx = newItems.findIndex((it) => it.title === "Created Committees");
  if (existingIdx !== -1) newItems.splice(existingIdx, 1);

  // Build dropdown with committees + meetings link
  const committeeMenuItems: MenuItem[] = [
    ...committees.map((c) => ({
      title: c.commitee_name,
      url: `/addedcommittee/${c.id}`,
      icon: UserCheck,
    })),
    {
      title: "Committee Meetings",
      url: "/committeemeeting",
      icon: CalendarClock,
    },
  ];

  const addedDropdown: MenuItem = {
    title: "Created Committees",
    icon: UserCheck,
    children: committeeMenuItems,
  };

  // Insert at root top if Staff Management is not present
  if (!newItems.find(item => item.title === 'Staff Management')) {
    newItems.unshift(addedDropdown);
  } else {
    // Insert right after Staff Management
    const staffMgmtIdx = newItems.findIndex(item => item.title === 'Staff Management');
    newItems.splice(staffMgmtIdx + 1, 0, addedDropdown);
  }

  return newItems;
}, [baseItems, committees]);
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

  // State for Command Menu
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
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
          pathMatches(currentPath, child.url)
        );
        if (hasActiveChild) {
          setOpenDropdowns(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [currentPath, items]);

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
      <CommandMenu open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen} />
      <div className="flex flex-col px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <img src={background} alt="Logo" className="w-7 h-7" />
              <span className="ml-2 hidden md:inline">JEEVANDEEP</span>
            </div>
          </DropdownMenuTrigger>
        </DropdownMenu>
        <div className="mt-2 flex w-full items-center gap-2">
          <button
            onClick={() => setIsCommandMenuOpen(true)}
            className="flex flex-grow items-center justify-between h-9 px-4 text-sm border border-transparent rounded-lg bg-transparent hover:bg-accent focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Open command menu"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 md:flex">
              <span className="text-xs">CTRL</span>+ K
            </kbd>
          </button>
          <NotificationPopover />
        </div>
      </div>
      <Separator className="my-2" />

      <SidebarContent className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto no-scrollbar">
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
                            className={`flex items-center w-full ${item.children?.some(child => pathMatches(currentPath, child.url)) ? "bg-blue-200 text-blue-600" : ""}`}
                          >
                            {item.icon && React.createElement(item.icon, { className: "mr-2 text-gray-600 dark:text-blue-300" })}
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
                            <SidebarMenuItem key={child.title} className="my-1">
                              <SidebarMenuButton asChild>
                                <a href={child.url} className={`flex items-center ${pathMatches(currentPath, child.url) ? "bg-[#339999] text-white" : ""}`}>
                                  {child.icon && React.createElement(child.icon, { className: `mr-2 ${pathMatches(currentPath, child.url) ? 'text-white' : 'text-gray-600 dark:text-blue-300'}` })}
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
                        <a href={item.url} className={`flex items-center ${item.url && pathMatches(currentPath, item.url) ? "bg-blue-100 text-blue-600" : ""}`}>
                            {item.icon && React.createElement(item.icon, { className: "mr-2 text-gray-600 dark:text-blue-300" })}
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
          {(role === 'viceprincipal' || role === 'teachingstaff' || role === 'cashier' || role === 'backoffice' || role === 'accountant' || role === 'admission' || role === 'admin' || role === 'nonteachingstaff') && (
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
