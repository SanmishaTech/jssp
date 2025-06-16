import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"; // Unused chart components
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
// import { useGetData } from "../HTTP/GET"; // Replaced with direct axios call
import { Users, TrendingUp, ClipboardList, MessageSquareWarning, FileText, Cake, CalendarClock, BookOpenCheck } from "lucide-react";
// DropdownMenu components are not used in the current view of this file
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress"; // Progress component not used
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Sheet components not used
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";

interface LeaveApplication {
  id: number;
  staff_name?: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string;
  approved_by: string;
  approved_at: string;
}

interface Event {
  id: any; // Or more specific type if known
  [key: string]: any; // Allow other properties
}

interface Task {
  id: any;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  // Add other task-specific fields if needed
}

interface Complaint {
  id: any;
  institute_id: number;
  institute_name: string;
  complaint_date: string;
  complainant_name: string; 
  nature_of_complaint: string; 
  description?: string;
  created_at?: string; 
}

interface Meeting {
  id: number;
  venue: string;
  synopsis: string;
  date: string;
  time: string;
}

interface Memo {
  id: any; 
  memo_subject: string; // Changed from title
  memo_description?: string; // Added description
  created_at: string; 
  // Add other relevant memo fields if your API provides them, e.g., author
}

interface StaffBirthday {
  id: any; 
  name: string;
  date_of_birth: string; // Formatted as "Mon DD"
}


interface TodaysSyllabusProgress {
  subject_name: string;
  course_name?: string;
  semester_name?: string;
  completed_percentage: number;
  remarks?: string;
}

// StaffMember interface might not be needed if not used elsewhere after consolidation
// interface StaffMember {
//   id: number;
//   lead_status: string;
//   follow_up_type: string;
//   staff_type: string;
// }

// const testVolumeData = [ // Unused static data
//   { name: "Jan", tests: 165 },
//   { name: "Feb", tests: 180 },
//   { name: "Mar", tests: 200 },
//   { name: "Apr", tests: 220 },
//   { name: "May", tests: 195 },
//   { name: "Jun", tests: 210 },
// ];

export default function ResponsiveLabDashboard() {
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : { name: 'User', role: '' }; // Provide defaults
  const userRole = currentUser.role;

  const [myLeads, setMyLeads] = useState(0);
  // const user = localStorage.getItem("user"); // User variable declared but not used directly, only User
  // const User = user ? JSON.parse(user) : null; // User variable not used, direct parsing in JSX
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [combinedCalendarItems, setCombinedCalendarItems] = useState<any[]>([]); 
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [complaintsData, setComplaintsData] = useState<Complaint[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApplication[]>([]);
  const [openLeadsCount, setOpenLeadsCount] = useState(0);
  const [memosData, setMemosData] = useState<Memo[]>([]);
  const [upcomingBirthdaysData, setUpcomingBirthdaysData] = useState<StaffBirthday[]>([]);
  const [todaysSyllabusProgress, setTodaysSyllabusProgress] = useState<TodaysSyllabusProgress[]>([]);
  const [staffList, setStaffList] = useState<{ id: number; staff_name: string }[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  // teachingCount and nonTeachingCount are not currently set by the new API
  // const [teachingCount, setTeachingCount] = useState(0);
  // const [nonTeachingCount, setNonTeachingCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`/api/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (response.data.status && response.data.data) {
          const data = response.data.data;

          if (Array.isArray(data.pending_leaves)) {
            setPendingLeaves(data.pending_leaves);
          } else {
            setPendingLeaves([]);
          }

          if (data.staff_summary) {
            setMyLeads(data.staff_summary.total_staff || 0);
            setOpenLeadsCount(data.staff_summary.open_leads || 0);
          }

          if (Array.isArray(data.meetings)) {
            setMeetings(response.data.data.meetings || []);
          }
          setEventsData(response.data.data.events || []);
          setTasksData(data.tasks || []);
          setComplaintsData(data.complaints || []);
          setMemosData(data.memos || []);
          setUpcomingBirthdaysData(data.upcoming_birthdays || []);

          // Combine and sort meetings and events
          const typedMeetings = (response.data.data.meetings || []).map((m: Meeting) => ({
            ...m,
            type: 'meeting',
            sortDate: new Date(m.date),
          }));
          const typedEvents = (response.data.data.events || []).map((e: Event) => ({
            ...e,
            type: 'event',
            sortDate: new Date(e.date), // Assuming event has a 'date' property
            title: e.title || 'Event', // Assuming event has a 'title', fallback if not
            description: e.description || '', // Assuming event has a 'description'
          }));

          const combined = [...typedMeetings, ...typedEvents];
          combined.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()); // Sort descending
          setCombinedCalendarItems(combined);

          setTasksData(response.data.data.tasks || []);
          setComplaintsData(response.data.data.complaints || []);

        } else {
          console.error("Error fetching dashboard data: Invalid response structure", response.data);
          setPendingLeaves([]);
          setMyLeads(0);
          setOpenLeadsCount(0);
          setMeetings([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setPendingLeaves([]);
        setMyLeads(0);
        setOpenLeadsCount(0);
        setMeetings([]);
      }
    };

    fetchDashboardData();
  }, []); // End of useEffect

  useEffect(() => {
    const fetchStaffList = async () => {
      if (userRole !== 'admin') return;
      try {
        const response = await axios.get('/api/staff', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        });
        if (response.data.status && response.data.data && response.data.data.Staff) {
          const staffArray = Array.isArray(response.data.data.Staff.data)
            ? response.data.data.Staff.data
            : response.data.data.Staff;
          setStaffList(
            staffArray.map((s: any) => ({ id: s.id, staff_name: s.staff_name || s.name }))
          );
        }
      } catch (error) {
        console.error('Error fetching staff list:', error);
      }
    };
    fetchStaffList();
  }, [userRole]);

  useEffect(() => {
    const fetchSyllabusProgress = async () => {
      try {
        let url = '/api/syllabus';
        if (['admin', 'viceprincipal'].includes(userRole) && selectedStaffId) {
          url += `?staff_id=${selectedStaffId}`;
        }
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        });
        if (response.data.status && Array.isArray(response.data.data)) {
          setTodaysSyllabusProgress(response.data.data);
        } else {
          setTodaysSyllabusProgress([]);
        }
      } catch (error) {
        console.error('Error fetching syllabus progress:', error);
        setTodaysSyllabusProgress([]);
      }
    };

    if (['admin', 'teachingstaff', 'viceprincipal'].includes(userRole)) {
      fetchSyllabusProgress();
    }
  }, [userRole, selectedStaffId]);

  // hide the page scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Strip HTML tags and truncate to 100 chars
  const getSynopsisPreview = (html: string = "") => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > 20 ? text.slice(0, 20) + "..." : text;
  };

  return (
    <div className="flex h-screen ">
      {/* Sidebar for larger screens */}
      {/* <Sidebar className="hidden md:block w-64 shadow-md" /> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome, {currentUser.name} 
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Cards for Teaching Staff and Non-Teaching Staff counts commented out.
              This data is not currently provided by the new /api/dashboard endpoint.
              To re-enable, update DashboardController.php to include these counts 
              and uncomment the state variables (teachingCount, nonTeachingCount) and these cards.
          <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teaching Staff
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachingCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Non-Teaching Staff
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nonTeachingCount}</div>
            </CardContent>
          </Card>
          */}

          {(userRole === 'admin' || userRole === 'viceprincipal') && (
            <>
              <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Staff Count
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myLeads}</div>
                </CardContent>
              </Card>

              <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Committies</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openLeadsCount}</div>
                </CardContent>
              </Card>
            </>
          )}

        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7 mt-4 mb-3">
          { (userRole === 'admin' || userRole === 'viceprincipal') && (
            <Card className="col-span-full lg:col-span-4 overflow-x-auto bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Leave Approvals</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate({ to: '/leaveapproval' })}
                  className="text-primary hover:text-primary/80"
                >
                  See All
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Staff Name</TableHead>
                      <TableHead>Leave Dates</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLeaves.length > 0 ? (
                      pendingLeaves.slice(0, 5).map((leave) => (
                        <TableRow 
                          key={leave.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: '/leaveapproval' })}
                        >
                          <TableCell className="font-medium">
                            {leave.staff_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {leave.reason}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No pending leave requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          <Card className={`col-span-full ${(userRole === 'admin' || userRole === 'viceprincipal') ? 'lg:col-span-3' : 'lg:col-span-7'} bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Meetings & Events</CardTitle>
                <p className="text-sm text-muted-foreground">Total: {meetings.length + eventsData.length}</p>
              </div>
              <CardDescription>
                  You have {meetings.length + eventsData.length} combined meetings and events.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {combinedCalendarItems.slice(0, 5).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.type === 'meeting' ? item.venue : item.title}
                        <span className="ml-2 text-xs text-muted-foreground">({item.type})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getSynopsisPreview(
                          item.type === 'meeting' ? item.synopsis : item.description
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{item.time || ''}</p> {/* Display time if available */}
                    </div>
                  </div>
                ))}
                {combinedCalendarItems.length >= 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/meetings" })}
                      className="text-xs hover:text-blue-500"
                    >
                      See More...
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tasks and Complaints Cards - New Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-4"> 
          {/* Tasks Card */}
          <Card className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-2 bg-accent/40">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center"><ClipboardList className="h-5 w-5 mr-2" />Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Total: {tasksData.length}</p>
              </div>
              <CardDescription>
                Recent tasks assigned or created.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasksData.length > 0 ? (
                  tasksData.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-start justify-between border-b border-border/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                      <div>
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</p>}
                      </div>
                      <Badge variant={(task.status && typeof task.status === 'string' && task.status.toLowerCase() === 'completed') ? 'default' : 'secondary'}>{task.status || 'Unknown'}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No tasks found.</p>
                )}
                {tasksData.length > 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/tasks" })} // Assuming a /tasks route
                      className="text-xs hover:text-blue-500"
                    >
                      See More...
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Complaints Card */}
          <Card className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-2 bg-accent/40">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center"><MessageSquareWarning className="h-5 w-5 mr-2" />Complaints</CardTitle>
                <p className="text-sm text-muted-foreground">Total: {complaintsData.length}</p>
              </div>
              <CardDescription>
                Recent complaints lodged.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complaintsData.length > 0 ? (
                  complaintsData.slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="flex items-start justify-between border-b border-border/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                      <div>
                        <p className="text-sm font-medium leading-none">{complaint.complainant_name}</p>
                        {complaint.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{complaint.description}</p>}
                      </div>
                      <Badge variant={(complaint.nature_of_complaint && typeof complaint.nature_of_complaint === 'string' && complaint.nature_of_complaint.toLowerCase() === 'resolved') ? 'default' : 'destructive'}>{complaint.nature_of_complaint || 'N/A'}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No complaints found.</p>
                )}
                {complaintsData.length > 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/complaints" })} // Assuming a /complaints route
                      className="text-xs hover:text-blue-500"
                    >
                      See More...
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Memos and Upcoming Birthdays Cards - New Row */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 mb-4">
          {/* Recent Memos Card */}
          <Card className="col-span-full md:col-span-1 lg:col-span-2 xl:col-span-2 bg-accent/40">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2" />Recent Memos</CardTitle>
                <p className="text-sm text-muted-foreground">Total: {memosData.length}</p>
              </div>
              <CardDescription>
                Latest internal communications and notices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memosData.length > 0 ? (
                  memosData.slice(0, 5).map((memo) => (
                    <div key={memo.id} className="flex items-start justify-between border-b border-border/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                      <div>
                        <p className="text-sm font-medium leading-none truncate" title={memo.memo_subject}>
                            {memo.memo_subject.length > 10 ? memo.memo_subject.substring(0, 10) + "..." : memo.memo_subject}
                          </p>
                        {memo.memo_description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate" title={memo.memo_description}>
                            {memo.memo_description.length > 10 ? memo.memo_description.substring(0, 10) + "..." : memo.memo_description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground pt-1">
                          {new Date(memo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {/* Optionally, add a badge or action here if memos have status or require actions */}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No recent memos found.</p>
                )}
                {memosData.length > 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/memo" })} // Changed to /memo based on lint suggestion
                      className="text-xs hover:text-blue-500"
                    >
                      See More...
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Birthdays Card */}
          <Card className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-1 bg-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center mb-1"><Cake className="h-5 w-5 mr-2" />Upcoming Birthdays</CardTitle>
              <div className="flex justify-between items-baseline">
                <CardDescription>
                  Staff birthdays in the next 30 days.
                </CardDescription>
                <p className="text-sm text-muted-foreground">Total: {upcomingBirthdaysData.length}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBirthdaysData.length > 0 ? (
                  upcomingBirthdaysData.slice(0, 5).map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between border-b border-border/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                      <p className="text-sm font-medium leading-none">{staff.name}</p>
                      <Badge variant="outline">{staff.date_of_birth}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No upcoming birthdays in the next 30 days.</p>
                )}
                {upcomingBirthdaysData.length > 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/staff-birthdays" })} // Assuming a route
                      className="text-xs hover:text-blue-500"
                    >
                      See More...
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Timetable and Syllabus Cards - New Row */}
        <div className="grid gap-4 lg:grid-cols-1 mb-4">


          {/* Today's Syllabus Progress Card */}
          {['admin', 'teachingstaff', 'viceprincipal'].includes(userRole) && (
          <Card className="col-span-full lg:col-span-1 bg-accent/40">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <BookOpenCheck className="h-5 w-5 mr-2" />
                  Overall Syllabus Progress
                </CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Subjects: {todaysSyllabusProgress.length}</p>
                  {/* Staff selector for admin and viceprincipal */}
                  {['admin', 'viceprincipal'].includes(userRole) && (
                    <select
                      value={selectedStaffId ?? ''}
                      onChange={(e) =>
                        setSelectedStaffId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="text-sm border rounded px-2 py-1 bg-background"
                    >
                      <option value="">Select Staff</option>
                      {staffList.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.staff_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <CardDescription>
                Progress for subjects in today's timetable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysSyllabusProgress.length > 0 ? (
                <div className="space-y-4 max-h-72 overflow-y-auto">
                  {todaysSyllabusProgress.map((syllabus, index) => (
                    <div key={index} className="border-b border-border/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium">{syllabus.subject_name}</p>
                        <Badge variant="secondary">{syllabus.completed_percentage}%</Badge>
                      </div>
                      {(syllabus.course_name || syllabus.semester_name) && (
                        <p className="text-xs text-muted-foreground">
                          {syllabus.course_name}{syllabus.course_name && syllabus.semester_name ? " - " : ""}{syllabus.semester_name}
                        </p>
                      )}
                      {syllabus.remarks && <p className="text-xs text-muted-foreground mt-1"><em>Remarks: {syllabus.remarks}</em></p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No syllabus progress to display for today's subjects.</p>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </main>
    </div>
  );
}
