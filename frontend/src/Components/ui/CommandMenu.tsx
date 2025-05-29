import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';
import { Search } from 'lucide-react';
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

// Define the MenuItem interface (similar to sidebar)
interface MenuItem {
  title: string;
  url?: string;
  children?: MenuItem[];
  icon?: React.ElementType;
}

// Define role-based navigation items matching the sidebar structure
const roleBasedItems: Record<string, MenuItem[]> = {
  superadmin: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Requisitions",
      url: "/requisitions",
      icon: Truck,
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
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Time Table",
      url: "/teachertimetable",
      icon: BookText,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
    },
    {
      title: "Holidays",
      icon: Calendar,
      children: [
        {
          title: "Regular Holidays",
          url: "/holiday",
          icon: Calendar,
        },
        {
          title: "Weekly Holidays",
          url: "/weeklyholiday",
          icon: Calendar,
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
      title: "Purchase Order",
      url: "/purchaseorders",
      icon: Truck,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
  
    {
      title: "Holidays",
      icon: Calendar,
      children: [
        {
          title: "Regular Holidays",
          url: "/holiday",
          icon: Calendar,
        },
        {
          title: "Weekly Holidays",
          url: "/weeklyholiday",
          icon: Calendar,
        }
      ]
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
      title: "Schedule & Calendar",
      icon: Calendar,
      children: [
        {
          title: "Calender",
          url: "/calender",
          icon: Calendar,
        },
        {
          title: "Time Table",
          url: "/teachertimetable",
          icon: FileText,
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
      ]
    },
    {
      title: "Inventory Management",
      icon: Package,
      children: [
        {
          title: "Vendors",
          url: "/vendors",
          icon: Truck,
        },
        {
          title: "Asset Categories",
          url: "/assetcategories",
          icon: Package,
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
          title: "Inventory",
          url: "/inventory",
          icon: Package,
        },
       
      ]
    },
    {
      title: "Staff Management",
      icon: Users,
      children: [
        {
          title: "Staff",
          url: "/staff",
          icon: Users,
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
      ]
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
      title: "Bank & Finance",
      icon: Landmark,
      children: [
        {
          title: "Bank Accounts",
          url: "/bankaccounts",
          icon: Banknote,
        },
        {
          title: "Bank",
          url: "/bank",
          icon: Landmark,
        },  
      ],
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
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
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Requisitions",
      url: "/requisitions",
      icon: Truck,
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
          icon: FileText,
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

interface CommandMenuProps {
  role?: string;
}

export function CommandMenu({ role }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItemsRef = useRef<Array<HTMLDivElement | null>>([]);
  const currentRole = role || localStorage.getItem('role') || 'teachingstaff'; // Default to teachingstaff if no role
  
  // Get menu items based on role
  const menuItems = roleBasedItems[currentRole as keyof typeof roleBasedItems] || roleBasedItems.teachingstaff;
  
  // Function to flatten the nested menu structure for search
  const flattenMenuItems = (items: MenuItem[]): Array<{title: string, url?: string, icon?: React.ElementType}> => {
    return items.reduce<Array<{title: string, url?: string, icon?: React.ElementType}>>((acc, item) => {
      if (item.url) {
        acc.push({ title: item.title, url: item.url, icon: item.icon });
      }
      
      if (item.children && item.children.length > 0) {
        // Add parent category as a heading
        acc.push({ title: `${item.title} (Category)` });
        
        // Add all children
        const childItems = item.children.map(child => ({
          title: child.title,
          url: child.url,
          icon: child.icon
        })).filter(child => child.url) as Array<{title: string, url: string, icon?: React.ElementType}>;
        
        acc.push(...childItems);
      }
      
      return acc;
    }, []);
  };
  
  // Flatten the menu structure for easier searching
  const allMenuItems = flattenMenuItems(menuItems);
  
  // Filter items based on search term and only include items with URLs
  const filteredItems = (search.length === 0 
    ? allMenuItems 
    : allMenuItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase())
      )).filter(item => item.url);
      
  // Group items by category for display
  const groupedItems = filteredItems.reduce<Record<string, Array<{title: string, url?: string, icon?: React.ElementType}>>>((acc, item) => {
    // Determine if it's a category heading
    if (item.title.includes('(Category)')) {
      const categoryName = item.title.replace(' (Category)', '');
      acc[categoryName] = [];
    } else if (item.url) {
      // Find the appropriate category
      const categoryName = Object.keys(acc).length > 0 
        ? Object.keys(acc)[Object.keys(acc).length - 1]
        : 'General';
      
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      
      acc[categoryName].push(item);
    }
    
    return acc;
  }, { 'General': [] });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);



  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredItems.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = filteredItems[selectedIndex];
        if (selectedItem?.url) {
          runCommand(selectedItem.url);
        }
      }
      
      // Scroll the selected item into view
      if (menuItemsRef.current[selectedIndex]) {
        menuItemsRef.current[selectedIndex]?.scrollIntoView({
          block: 'nearest'
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, search, selectedIndex, filteredItems]);
  
  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const runCommand = (path: string) => {
    setOpen(false);
    window.location.href = path;
  };
  

  
  return (
    <>
      {/* Custom search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-2xl bg-white">
          <DialogTitle className="sr-only">Search navigation</DialogTitle>
          <DialogDescription className="sr-only">Search for navigation items and pages in the application</DialogDescription>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm">No results found.</div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => {
                // Skip empty categories
                if (items.length === 0) return null;
                
                return (
                  <div key={category} className="p-2">
                    {category !== 'General' && (
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {category}
                      </div>
                    )}
                    {items.map((item) => (
                      item.url && (
                        <div
                          key={item.url}
                          ref={el => {
                            const index = filteredItems.findIndex(i => i.url === item.url);
                            if (index !== -1) {
                              menuItemsRef.current[index] = el;
                            }
                          }}
                          className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none ${
                            selectedIndex === filteredItems.findIndex(i => i.url === item.url) 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                          onClick={() => runCommand(item.url!)}
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
                          {item.title}
                        </div>
                      )
                    ))}
                    <div className="-mx-1 h-px bg-border my-1"></div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
