import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useGetData } from "../HTTP/GET";
import { Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import userAvatar from "@/images/Profile.jpg";

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

interface Meeting {
  id: number;
  venue: string;
  synopsis: string;
  date: string;
  time: string;
}

interface StaffMember {
  id: number;
  lead_status: string;
  follow_up_type: string;
  staff_type: string;
}

const testVolumeData = [
  { name: "Jan", tests: 165 },
  { name: "Feb", tests: 180 },
  { name: "Mar", tests: 200 },
  { name: "Apr", tests: 220 },
  { name: "May", tests: 195 },
  { name: "Jun", tests: 210 },
];

export default function ResponsiveLabDashboard() {
  const [myLeads, setMyLeads] = useState(0);
  const user = localStorage.getItem("user");
  const User = user ? JSON.parse(user) : null;
  const navigate = useNavigate();
  const [leads, setLeads] = useState<StaffMember[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApplication[]>([]);
  const [openLeadsCount, setOpenLeadsCount] = useState(0);
  const [followUpLeadsCount, setFollowUpLeadsCount] = useState(0);
  const [teachingCount, setTeachingCount] = useState(0);
  const [nonTeachingCount, setNonTeachingCount] = useState(0);

  // Fetch pending leaves
  useGetData({
    endpoint: '/api/leaves/status/pending',
    params: {
      queryKey: ['leaves-pending'],
      onSuccess: (data: any) => {
        if (data?.data?.Leave && Array.isArray(data.data.Leave)) {
          setPendingLeaves(data.data.Leave);
        } else if (data?.data && Array.isArray(data.data)) {
          setPendingLeaves(data.data);
        } else {
          setPendingLeaves([]);
        }
      },
      onError: (error) => {
        console.error("Error fetching pending leaves:", error);
        setPendingLeaves([]);
      }
    }
  });

  // Fetch staff leads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/all_staff`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        const leads = response.data.data.Staff;
        setLeads(leads);
        const openLeads = leads.filter((lead) => lead.lead_status === "Open");
        setMyLeads(leads.length);
        setOpenLeadsCount(openLeads.length);
        const followUpLeads = leads.filter(
          (lead) => lead.follow_up_type === "Call"
        );
        setFollowUpLeadsCount(followUpLeads.length);
      } catch (error) {
        console.error("Error fetching dashboard leads data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`/api/all_meetings`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        if (response.data.status) {
          const meetingsData = response.data.data.Meeting;
          setMeetings(meetingsData);
          // Filter based on the staff_type property
          setTeachingCount(
            leads.filter((lead) => lead.staff_type === "Teaching").length
          );
          setNonTeachingCount(
            leads.filter((lead) => lead.staff_type === "Non-Teaching").length
          );
        } else {
          console.error("Failed to fetch meetings:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div className="flex h-screen ">
      {/* Sidebar for larger screens */}
      {/* <Sidebar className="hidden md:block w-64 shadow-md" /> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome, {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'} ({localStorage.getItem('role') || 'Staff'})
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-accent/40">
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
          <Card className="bg-accent/40">
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

          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Meetings Today
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{followUpLeadsCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Events</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myLeads && myLeads}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4 ">
          <Card className="col-span-full lg:col-span-4 overflow-x-auto bg-accent/40">
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
          <Card className="col-span-full lg:col-span-3 overflow-x-auto bg-accent/40">
            <CardHeader>
              <CardTitle>My Meetings</CardTitle>
              <CardDescription>Meetings with Clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.slice(0, 5).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{meeting.venue}</p>
                      <p className="text-sm text-muted-foreground">
                        {meeting.synopsis}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(meeting.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{meeting.time}</p>
                    </div>
                  </div>
                ))}
                {meetings.length >= 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate("/meetings")}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Card className="col-span-full lg:col-span-4 bg-accent/40">
            <CardHeader>
              <CardTitle>Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={testVolumeData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar dataKey="tests" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-full lg:col-span-3 bg-accent/40">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Accuracy</div>
                    <div className="text-sm text-muted-foreground">98.2%</div>
                  </div>
                  <div>+0.2%</div>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Turnaround Time</div>
                    <div className="text-sm text-muted-foreground">
                      24.5 hours
                    </div>
                  </div>
                  <div>-1.5h</div>
                </div>
                <Progress value={82} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Utilization</div>
                    <div className="text-sm text-muted-foreground">87.3%</div>
                  </div>
                  <div>+3.7%</div>
                </div>
                <Progress value={87} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
