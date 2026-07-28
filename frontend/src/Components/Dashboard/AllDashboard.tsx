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

interface SupervisionDuty {
  id: number;
  exam_name: string;
  date: string;
  exam_time: string;
  course_name: string;
  subject_name: string;
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
  const [supervisionDuties, setSupervisionDuties] = useState<SupervisionDuty[]>([]);
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

          if (currentUser.role === 'teachingstaff') {
            const supervisionResponse = await axios.get('/api/supervision-duties', {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            });
            if (supervisionResponse.data.status && supervisionResponse.data.data) {
              setSupervisionDuties(supervisionResponse.data.data.SupervisionDuties || []);
            }
          }

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
  const getSynopsisPreview = (html?: string | null) => {
    const safeHtml = html ?? "";
    const text = safeHtml.replace(/<[^>]+>/g, "");
    return text.length > 20 ? text.slice(0, 20) + "..." : text;
  };

  const formatBadgeLabel = (value?: string | null, fallback = "Unknown") => {
    if (!value) return fallback;
    return value
      .replace(/_/g, " ")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="@container/dashboard min-w-0 w-full p-4 pb-8 @md/dashboard:p-8 @md/dashboard:pb-10">
        <div className="mb-6 flex min-w-0 items-center justify-between gap-2">
          <h1 className="truncate text-2xl font-bold @md/dashboard:text-3xl">
            Welcome, {currentUser.name} 
          </h1>
        </div>

        <div className="grid gap-4 @md/dashboard:grid-cols-2">
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

        <div className="mb-3 mt-4 grid gap-4 @md/dashboard:grid-cols-2 @md/dashboard:gap-8 @lg/dashboard:grid-cols-4">
          {userRole === 'teachingstaff' && supervisionDuties.length > 0 && (
            <Card className="col-span-full min-w-0 overflow-hidden @lg/dashboard:col-span-4">
              <CardHeader>
                <CardTitle>My Supervision Duties</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supervisionDuties.slice(0, 5).map((duty) => (
                      <TableRow key={duty.id}>
                        <TableCell>{duty.exam_name}</TableCell>
                        <TableCell>{duty.subject_name}</TableCell>
                        <TableCell>{duty.exam_time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {supervisionDuties.length > 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/displaytimetable" })}
                      className="text-xs hover:text-blue-500"
                    >
                      Show More...
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          { (userRole === 'admin' || userRole === 'viceprincipal') && (
            <Card className="col-span-full min-w-0 overflow-x-auto bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg @lg/dashboard:col-span-4">
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
          <Card className={`col-span-full min-w-0 overflow-hidden bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg ${(userRole === 'admin' || userRole === 'viceprincipal') ? '@lg/dashboard:col-span-3' : '@lg/dashboard:col-span-4'}`}>
            <CardHeader>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <CardTitle className="min-w-0 truncate">Meetings & Events</CardTitle>
                <p className="shrink-0 text-sm text-muted-foreground">Total: {meetings.length + eventsData.length}</p>
              </div>
              <CardDescription>
                  You have {meetings.length + eventsData.length} combined meetings and events.
                </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="space-y-4">
                {combinedCalendarItems.slice(0, 5).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex min-w-0 items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {item.type === 'meeting' ? item.venue : item.title}
                        <span className="ml-2 text-xs text-muted-foreground">({item.type})</span>
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {getSynopsisPreview(
                          item.type === 'meeting' ? item.synopsis : item.description
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
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
        {/* Tasks and Complaints — side-by-side when pane ≥ 1024px (container @lg ≠ viewport lg) */}
        <div className="mb-4 grid min-w-0 gap-4 @[1024px]/dashboard:grid-cols-2">
          {/* Tasks Card */}
          <Card className="@container col-span-full min-w-0 overflow-hidden bg-accent/40 @[1024px]/dashboard:col-span-1">
            <CardHeader>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <CardTitle className="flex min-w-0 items-center truncate"><ClipboardList className="mr-2 h-5 w-5 shrink-0" />Tasks</CardTitle>
                <p className="shrink-0 text-sm text-muted-foreground">Total: {tasksData.length}</p>
              </div>
              <CardDescription>
                Recent tasks assigned or created.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="min-w-0 space-y-3">
                {tasksData.length > 0 ? (
                  tasksData.slice(0, 3).map((task) => (
                    <div key={task.id} className="mb-3 flex min-w-0 flex-col gap-1.5 border-b border-border/50 pb-3 last:mb-0 last:border-b-0 last:pb-0 @sm:flex-row @sm:items-start @sm:justify-between @sm:gap-2">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium leading-none" title={task.title}>{task.title}</p>
                        {task.description && <p className="truncate text-xs text-muted-foreground" title={task.description}>{task.description}</p>}
                      </div>
                      <Badge className="w-fit shrink-0 justify-center whitespace-nowrap" variant={(task.status && typeof task.status === 'string' && task.status.toLowerCase() === 'completed') ? 'default' : 'secondary'}>{formatBadgeLabel(task.status)}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No tasks found.</p>
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
          <Card className="@container col-span-full min-w-0 overflow-hidden bg-accent/40 @[1024px]/dashboard:col-span-1">
            <CardHeader>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <CardTitle className="flex min-w-0 items-center truncate"><MessageSquareWarning className="mr-2 h-5 w-5 shrink-0" />Complaints</CardTitle>
                <p className="shrink-0 text-sm text-muted-foreground">Total: {complaintsData.length}</p>
              </div>
              <CardDescription>
                Recent complaints lodged.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="min-w-0 space-y-3">
                {complaintsData.length > 0 ? (
                  complaintsData.slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="mb-3 flex min-w-0 flex-col gap-1.5 border-b border-border/50 pb-3 last:mb-0 last:border-b-0 last:pb-0 @sm:flex-row @sm:items-start @sm:justify-between @sm:gap-2">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium leading-none" title={complaint.complainant_name}>{complaint.complainant_name}</p>
                        {complaint.description && <p className="truncate text-xs text-muted-foreground" title={complaint.description}>{complaint.description}</p>}
                      </div>
                      <Badge className="w-fit max-w-full shrink-0 justify-center whitespace-nowrap" title={complaint.nature_of_complaint || undefined} variant={(complaint.nature_of_complaint && typeof complaint.nature_of_complaint === 'string' && complaint.nature_of_complaint.toLowerCase() === 'resolved') ? 'default' : 'destructive'}>{formatBadgeLabel(complaint.nature_of_complaint, "N/A")}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No complaints found.</p>
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

        {/* Memos + Birthdays — side-by-side when pane ≥ 1100px (container @xl is only 36rem/576px!) */}
        <div className="mb-4 grid min-w-0 gap-4 @[1100px]/dashboard:grid-cols-3">
          {/* Recent Memos Card */}
          <Card className="@container col-span-full min-w-0 overflow-hidden bg-accent/40 @[1100px]/dashboard:col-span-2">
            <CardHeader>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <CardTitle className="flex min-w-0 items-center truncate"><FileText className="mr-2 h-5 w-5 shrink-0" />Recent Memos</CardTitle>
                <p className="shrink-0 text-sm text-muted-foreground">Total: {memosData.length}</p>
              </div>
              <CardDescription>
                Latest internal communications and notices.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="min-w-0 space-y-3">
                {memosData.length > 0 ? (
                  memosData.slice(0, 5).map((memo) => (
                    <div key={memo.id} className="mb-3 flex min-w-0 items-start justify-between border-b border-border/50 pb-3 last:mb-0 last:border-b-0 last:pb-0">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium leading-none" title={memo.memo_subject}>
                            {memo.memo_subject}
                          </p>
                        {memo.memo_description && (
                          <p className="mt-1 truncate text-xs text-muted-foreground" title={memo.memo_description}>
                            {memo.memo_description}
                          </p>
                        )}
                        <p className="pt-1 text-xs text-muted-foreground">
                          {new Date(memo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No recent memos found.</p>
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
          <Card className="@container col-span-full min-w-0 overflow-hidden bg-accent/40 @[1100px]/dashboard:col-span-1">
            <CardHeader>
              <CardTitle className="mb-1 flex min-w-0 items-center truncate"><Cake className="mr-2 h-5 w-5 shrink-0" />Upcoming Birthdays</CardTitle>
              <div className="flex min-w-0 flex-col gap-1 @sm:flex-row @sm:items-baseline @sm:justify-between">
                <CardDescription>
                  Staff birthdays in the next 30 days.
                </CardDescription>
                <p className="shrink-0 text-sm text-muted-foreground">Total: {upcomingBirthdaysData.length}</p>
              </div>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="min-w-0 space-y-3">
                {upcomingBirthdaysData.length > 0 ? (
                  upcomingBirthdaysData.slice(0, 5).map((staff) => (
                    <div key={staff.id} className="mb-3 flex min-w-0 items-center justify-between gap-2 border-b border-border/50 pb-3 last:mb-0 last:border-b-0 last:pb-0">
                      <p className="min-w-0 truncate text-sm font-medium leading-none" title={staff.name}>{staff.name}</p>
                      <Badge className="shrink-0 whitespace-nowrap" variant="outline">{staff.date_of_birth}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No upcoming birthdays in the next 30 days.</p>
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
        <div className="mb-4 grid min-w-0 gap-4">


          {/* Today's Syllabus Progress Card */}
          {['admin', 'teachingstaff', 'viceprincipal'].includes(userRole) && (
          <Card className="@container col-span-full min-w-0 overflow-hidden bg-accent/40">
            <CardHeader>
              <div className="flex min-w-0 flex-col gap-2 @md:flex-row @md:items-center @md:justify-between">
                <CardTitle className="flex min-w-0 items-center truncate">
                  <BookOpenCheck className="mr-2 h-5 w-5 shrink-0" />
                  Overall Syllabus Progress
                </CardTitle>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="shrink-0 text-sm text-muted-foreground">Subjects: {todaysSyllabusProgress.length}</p>
                  {/* Staff selector for admin and viceprincipal */}
                  {['admin', 'viceprincipal'].includes(userRole) && (
                    <select
                      value={selectedStaffId ?? ''}
                      onChange={(e) =>
                        setSelectedStaffId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="max-w-full rounded border bg-background px-2 py-1 text-sm"
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
            <CardContent className="min-w-0">
              {todaysSyllabusProgress.length > 0 ? (
                <div className="max-h-72 space-y-4 overflow-y-auto">
                  {todaysSyllabusProgress.map((syllabus, index) => (
                    <div key={index} className="mb-3 border-b border-border/50 pb-3 last:mb-0 last:border-b-0 last:pb-0">
                      <div className="mb-1 flex min-w-0 items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium" title={syllabus.subject_name}>{syllabus.subject_name}</p>
                        <Badge className="shrink-0" variant="secondary">{syllabus.completed_percentage}%</Badge>
                      </div>
                      {(syllabus.course_name || syllabus.semester_name) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {syllabus.course_name}{syllabus.course_name && syllabus.semester_name ? " - " : ""}{syllabus.semester_name}
                        </p>
                      )}
                      {syllabus.remarks && <p className="mt-1 truncate text-xs text-muted-foreground" title={syllabus.remarks}><em>Remarks: {syllabus.remarks}</em></p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No syllabus progress to display for today's subjects.</p>
              )}
            </CardContent>
          </Card>
          )}
        </div>
    </div>
  );
}
