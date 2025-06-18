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
export interface MenuItem {
  title: string;
  url?: string;
  children?: MenuItem[];
  icon?: React.ElementType;
}

// Define role-based navigation items matching the sidebar structure
export const searchconfig: Record<string, MenuItem[]> = {
  superadmin: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
    {
      title: "Requisitions/Demand",
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
  
  admin: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
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
      title: "Exam",
      icon: Calendar,
      children: [
        {
          title: "Add Exam",
          url: "/addexam",
          icon: Calendar,
        },
        {
          title: "Exam Calender",
          url: "/examcalender",
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
        {
          title: "Syllabus",
          url: "/syllabus",
          icon: Truck,
        },
        {
          title: "Allocation",
          url: "/allocation",
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
          title: "Requisitions/Demand",
          url: "/requisitions",
          icon: Truck,
        },
        {
          title: "Inventory",
          url: "/inventory",
          icon: Package,
        },
        {
          title: "Transfer",
          url: "/transfer",
          icon: Package,
        },
        {
          title: "Purchase Order",
          url: "/purchaseorders",
          icon: Truck,
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
  viceprincipal: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
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
        {
          title: "Syllabus",
          url: "/syllabus",
          icon: Truck,
        },
        {
          title: "Allocation",
          url: "/allocation",
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
          title: "Requisitions/Demand",
          url: "/requisitions",
          icon: Truck,
        },
        {
          title: "Inventory",
          url: "/inventory",
          icon: Package,
        },
      
        {
          title: "Purchase Order",
          url: "/purchaseorders",
          icon: Truck,
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
  
  officesuperintendent: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
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
          title: "Requisitions/Demand",
          url: "/requisitions",
          icon: Truck,
        },
        {
          title: "Inventory",
          url: "/inventory",
          icon: Package,
        },
        {
          title: "Transfer",
          url: "/transfer",
          icon: Package,
        },
        {
          title: "Purchase Order",
          url: "/purchaseorders",
          icon: Truck,
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
  
  cashier: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },

    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Requisitions/Demand",
      url: "/requisitions",
      icon: Truck,
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
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
    },
   
    
    
  ],
  accountant: [
    
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
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
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
          title: "Requisitions/Demand",
          url: "/requisitions",
          icon: Truck,
        },
        {
          title: "Inventory",
          url: "/inventory",
          icon: Package,
        },
        {
          title: "Purchase Order",
          url: "/purchaseorders",
          icon: Truck,
        },
       
      ]
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
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Home,
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
    {
      title: "Purchase Order",
      url: "/purchaseorders",
      icon: Truck,
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
  admission: [
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
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    }, 
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
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
      title: "Requisitions/Demand",
      url: "/requisitions",
      icon: Truck,
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
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    }, 
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
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
    {
      title: "Syllabus",
      url: "/syllabus",
      icon: FileText,
    }, 
    {
      title: "Complaints",
      url: "/complaints",
      icon: MessageCircle,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
    },
    {
      title: "Requisitions/Demand",
      url: "/requisitions",
      icon: Truck,
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
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
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
      title: "Requisitions/Demand",
      url: "/requisitions",
      icon: Truck,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
   
  ],

  librarian: [
    
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
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
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
      title: "Requisitions/Demand",
      url: "/requisitions",
      icon: Truck,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
   
  ],

  storekeeper: [
    
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
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
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
          title: "Leave Application",
          url: "/leave",
          icon: FileText,
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
          title: "Requisitions/Demand",
          url: "/requisitions",
          icon: Truck,
        },
        {
          title: "Inventory",
          url: "/inventory",
          icon: Package,
        },
        {
          title: "Purchase Order",
          url: "/purchaseorders",
          icon: Truck,
        },
       
      ]
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

  hod: [
    
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Task Manager",
      url: "/taskmanager",
      icon: FileText,
    },
    {
      title: "Calender",
      url: "/calender",
      icon: Calendar,
    }, 
    
    {
      title: "Leave Application",
      url: "/leave",
      icon: FileText,
    },
    {
      title: "Leave Approval",
      url: "/leaveapproval",
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
          title: "Syllabus",
          url: "/syllabus",
          icon: Truck,
        },
        {
          title: "Allocation",
          url: "/allocation",
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
      title: "Requisitions/Demand",
      url: "/requisitions",
      icon: Truck,
    },
    {
      title: "Notice",
      url: "/notice",
      icon: FileText,
    },
    {
      title: "Memo",
      url: "/memo",
      icon: FileText,
    },
    

   
  ],

  
 
  
};
