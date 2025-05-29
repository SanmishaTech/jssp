import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from './dialog';
import { Search } from 'lucide-react';

// Define the MenuItem interface (similar to sidebar)
interface MenuItem {
  title: string;
  url?: string;
  children?: MenuItem[];
}

// Define role-based navigation items matching the sidebar structure
const roleBasedItems: Record<string, MenuItem[]> = {
  superadmin: [
    {
      title: "Dashboard",
      url: "/dashboards",
    },
    {
      title: "Requisitions",
      url: "/requisitions",
    },
    {
      title: "Leave Approval",
      url: "/leaveapproval",
    },
    {
      title: "Calender",
      url: "/calender",
    },
    {
      title: "Trustees",
      url: "/trusties",
    },
    {
      title: "Institutes",
      url: "/institutes",
    },
    {
      title: "Inventory",
      url: "/inventory",
    },
    {
      title: "Complaints",
      url: "/complaints",
    },
  ],
  viceprincipal: [
    {
      title: "Dashboard",
      url: "/dashboards",
    },
    {
      title: "Memo",
      url: "/memo",
    },
    {
      title: "Time Table",
      url: "/teachertimetable",
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
    },
    {
      title: "Holidays",
      children: [
        {
          title: "Regular Holidays",
          url: "/holiday",
        },
        {
          title: "Weekly Holidays",
          url: "/weeklyholiday",
        }
      ]
    },
    {
      title: "Staff Management",
      children: [
        {
          title: "Staff Directory",
          url: "/staff",
        },
        {
          title: "Leave Approval",
          url: "/leaveapproval",
        }
      ]
    },
    {
      title: "Calendar",
      url: "/calender",
    },
    {
      title: "Academic Oversight",
      children: [
        {
          title: "Courses",
          url: "/courses",
        },
        {
          title: "Subjects",
          url: "/subjects",
        },
        {
          title: "Divisions",
          url: "/divisions",
        }
      ]
    },
    {
      title: "Student Affairs",
      children: [
        {
          title: "Students",
          url: "/students",
        },
        {
          title: "Complaints",
          url: "/complaints",
        }
      ]
    },
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/dashboards",
    },
    {
      title: "Purchase Order",
      url: "/purchaseorders",
    },
    {
      title: "Memo",
      url: "/memo",
    },
    {
      title: "Holidays",
      children: [
        {
          title: "Regular Holidays",
          url: "/holiday",
        },
        {
          title: "Weekly Holidays",
          url: "/weeklyholiday",
        }
      ]
    },
    {
      title: "Academic Information",
      children: [
        {
          title: "Acadamic Year",
          url: "/academicyears",
        },
        {
          title: "Courses",
          url: "/courses",
        },
        {
          title: "Semester",
          url: "/semester",
        },
        {
          title: "Subjects",
          url: "/subjects",
        }
      ]
    },
  ],
  backoffice: [
    {
      title: "Dashboard",
      url: "/dashboards",
    },
    {
      title: "Students",
      url: "/students",
    },
    {
      title: "Staff",
      url: "/staff",
    },
    {
      title: "Calendar",
      url: "/calender",
    },
    {
      title: "Holidays",
      url: "/holiday",
    },
  ],
  teachingstaff: [
    {
      title: "Dashboard",
      url: "/dashboards",
    },
    {
      title: "My Timetable",
      url: "/teachertimetable",
    },
    {
      title: "My Leave",
      url: "/leave",
    },
    {
      title: "Calendar",
      url: "/calender",
    },
    {
      title: "Holidays",
      url: "/holiday",
    },
  ],
};

interface CommandMenuProps {
  role?: string;
}

export function CommandMenu({ role }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const currentRole = role || localStorage.getItem('role') || 'teachingstaff'; // Default to teachingstaff if no role

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

  const runCommand = (path: string) => {
    setOpen(false);
    window.location.href = path;
  };
  
  // Function to flatten the nested menu structure for search
  const flattenMenuItems = (items: MenuItem[]): Array<{title: string, url?: string}> => {
    return items.reduce<Array<{title: string, url?: string}>>((acc, item) => {
      if (item.url) {
        acc.push({ title: item.title, url: item.url });
      }
      
      if (item.children && item.children.length > 0) {
        // Add parent category as a heading
        acc.push({ title: `${item.title} (Category)` });
        
        // Add all children
        const childItems = item.children.map(child => ({
          title: child.title,
          url: child.url
        })).filter(child => child.url) as Array<{title: string, url: string}>;
        
        acc.push(...childItems);
      }
      
      return acc;
    }, []);
  };

  // Get menu items based on role
  const menuItems = roleBasedItems[currentRole as keyof typeof roleBasedItems] || roleBasedItems.teachingstaff;
  
  // Flatten the menu structure for easier searching
  const allMenuItems = flattenMenuItems(menuItems);
  
  // Filter items based on search term
  const filteredItems = search.length === 0 
    ? allMenuItems 
    : allMenuItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      
  // Group items by category for display
  const groupedItems = filteredItems.reduce<Record<string, Array<{title: string, url?: string}>>>((acc, item) => {
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
  
  return (
    <>
      {/* Custom search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-md bg-white">
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
          <div className="max-h-[300px] overflow-y-auto">
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
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onClick={() => runCommand(item.url!)}
                        >
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
