import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Bell,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "@tanstack/react-router";
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

// Updated data structure based on your requirements
const recentTests = [
  {
    id: "T001",
    contact_person: "John Doe",
    follow_up_remark: "Blood Panel",
    status: "Completed",
    follow_up_type: "High",
  },
  {
    id: "T002",
    contact_person: "Jane Smith",
    follow_up_remark: "Urinalysis",
    status: "Completed",
    follow_up_type: "Medium",
  },
  {
    id: "T003",
    contact_person: "Bob Johnson",
    follow_up_remark: "Lipid Panel",
    status: "In Progress",
    follow_up_type: "Low",
  },
  {
    id: "T004",
    contact_person: "Alice Brown",
    follow_up_remark: "Thyroid Function",
    status: "Completed",
    follow_up_type: "Medium",
  },
  {
    id: "T005",
    contact_person: "Charlie Davis",
    follow_up_remark: "Liver Function",
    status: "Completed",
    follow_up_type: "High",
  },
];

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
  const User = JSON.parse(user);
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);

  const [openLeadsCount, setOpenLeadsCount] = useState(0);
  const [followUpLeadsCount, setFollowUpLeadsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/all_leads`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        const leads = response.data.data.Lead;
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

  return (
    <div className="flex h-screen ">
      {/* Sidebar for larger screens */}
      {/* <Sidebar className="hidden md:block w-64 shadow-md" /> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold ">Welcome,(Staff)</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Open Deals
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openLeadsCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Untouched Deals
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openLeadsCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Calls Today
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{followUpLeadsCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myLeads && myLeads}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4 ">
          <Card className="col-span-full lg:col-span-4 overflow-x-auto bg-accent/40">
            <CardHeader>
              <CardTitle>My Open Tasks</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Task ID</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Follow-Up Remark</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>{test.contact_person}</TableCell>
                      <TableCell>{test.follow_up_remark}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            test.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            test.follow_up_type === "Low"
                              ? "success"
                              : test.follow_up_type === "High"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {test.follow_up_type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                {leads.slice(0, 5).map((test) => (
                  <div key={test.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {test.contact.contact_person}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {test.follow_up_remark}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Badge
                        variant={
                          test.follow_up_type === "High"
                            ? "destructive"
                            : test.follow_up_type === "Medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {test.follow_up_type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {test.lead_follow_up_date
                          ? `${new Date(test.lead_follow_up_date)
                              .getDate()
                              .toString()
                              .padStart(2, "0")}/${(
                              new Date(test.lead_follow_up_date).getMonth() + 1
                            )
                              .toString()
                              .padStart(2, "0")}/${new Date(
                              test.lead_follow_up_date
                            ).getFullYear()}`
                          : "DD/MM/YYYY"}
                      </p>
                    </div>
                  </div>
                ))}
                {leads.length >= 5 && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate("/leads")}
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
