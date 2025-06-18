import React, { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { Editor } from "primereact/editor";
import MeetingDetailsDialog from "@/Components/meetings/MeetingDetailsDialog";
import EditMeetingDialog from "@/Components/meetings/EditMeetingDialog";
import { useGetData } from "@/Components/HTTP/GET";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "sonner";

interface Committee {
  id: number;
  commitee_name: string;
}


const meetingSchema = z.object({
  committee_id: z.string().nonempty("Committee is required"),
  venue: z.string().trim().nonempty("Venue is required"),
  date: z.string().trim().nonempty("Date is required"),
  time: z.string().trim().nonempty("Time is required"),
  synopsis: z.any().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

export default function CommitteeMeetings() {
  const queryClient = useQueryClient();
  // Committees list
  const committeesQuery = useGetData({ endpoint: "/api/all_committee", params: { queryKey: ["committees"] } });
  // Raw list from API
  const committeesRaw: Committee[] = useMemo(() => {
    if (committeesQuery.data && (committeesQuery.data as any).data?.Commitee) {
      return (committeesQuery.data as any).data.Commitee as Committee[];
    }
    return [];
  }, [committeesQuery.data]);

  // Read role and logged-in staff id from localStorage
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") || "" : "";

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const loggedStaffId = useMemo(() => {
    if (!userStr) return null;
    try {
      const u = JSON.parse(userStr as string);
      return u.staff_id ?? u.id ?? null;
    } catch {
      return null;
    }
  }, [userStr]);

  // Filter committees depending on role
  const committees: Committee[] = useMemo(() => {
    if (role === "admin" || role === "viceprincipal") return committeesRaw;
    return committeesRaw.filter((c: any) => {
      if (!c.staff || !Array.isArray(c.staff)) return false;
      return c.staff.some((s: any) => s.staff_id === loggedStaffId);
    });
  }, [committeesRaw, role, loggedStaffId]);

  // Selected committee id (state shared across tabs)
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>("");
  // Dialog states for meeting details & editing
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<any | null>(null);

  const handleRowClick = (meeting: any) => {
    setSelectedMeeting(meeting);
  };
  const handleCloseDetails = () => {
    setSelectedMeeting(null);
  };
  const handleOpenEdit = (meeting: any) => {
    setEditingMeeting(meeting);
  };
  const handleCloseEdit = () => {
    setEditingMeeting(null);
  };

  

  /* -------------------------- Create Meeting Form ------------------------- */
  const form = useForm<MeetingFormValues>({ resolver: zodResolver(meetingSchema), defaultValues: {} as Partial<MeetingFormValues> });

  // Update staff list when committee changes
  const committeeFieldValue = form.watch("committee_id");
  React.useEffect(() => {
    setSelectedCommitteeId(committeeFieldValue || "");
  }, [committeeFieldValue]);

  const token = localStorage.getItem("token");
  const createMeetingMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axios.post("/api/committee-meetings", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Meeting created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["committeeMeetings", selectedCommitteeId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error creating meeting");
    },
  });

  const onSubmit = (data: MeetingFormValues) => {
    const payload = { ...data, committee_id: Number(data.committee_id) };
    createMeetingMutation.mutate(payload);
  };

  /* --------------------------- Meeting History --------------------------- */
  // Permission
  const canEdit = role === "admin" || role === "viceprincipal";

  const meetingsQuery = useGetData({
    endpoint: selectedCommitteeId ? `/api/committee-meetings?committee_id=${selectedCommitteeId}` : "",
    params: { enabled: !!selectedCommitteeId, queryKey: ["committeeMeetings", selectedCommitteeId] },
  });

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Committee Meetings</CardTitle>
        <CardDescription>Create meetings and view history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 mb-4">
              <TabsTrigger value="create">Create Meeting</TabsTrigger>
              <TabsTrigger value="history">Meeting History</TabsTrigger>
            </TabsList>

          {/* ---------------- Create Meeting Tab ---------------- */}
          <TabsContent value="create">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="committee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Committee <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select committee" />
                            </SelectTrigger>
                            <SelectContent>
                              {committees.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.commitee_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  

                  <FormField
                    control={form.control}
                    name="synopsis"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Synopsis</FormLabel>
                        <FormControl>
                          <Editor
                            className="w-full"
                            value={field.value || ""}
                            onTextChange={(e) => field.onChange(e.htmlValue)}
                            style={{ minHeight: 200, maxHeight: 300 }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="reset" variant="secondary" onClick={() => form.reset()}>Clear</Button>
                  <Button type="submit" disabled={createMeetingMutation.isPending}>Create Meeting</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* ---------------- Meeting History Tab ---------------- */}
          <TabsContent value="history">
            <div className="mb-4 max-w-sm">
              <Select value={selectedCommitteeId} onValueChange={setSelectedCommitteeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.commitee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {meetingsQuery.isLoading && <p>Loading meetings…</p>}
            {meetingsQuery.data && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Synopsis</TableHead>
                      {canEdit && <TableHead className="text-right">Actions</TableHead>}
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingsQuery.isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                          {canEdit && <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>}
                        </TableRow>
                      ))
                    ) : meetingsQuery.data && (meetingsQuery.data as any).data?.meetings?.length > 0 ? (
                      (meetingsQuery.data as any).data.meetings.map((m: any) => (
                        <TableRow key={m.id} onClick={() => handleRowClick(m)} className="cursor-pointer">
                          <TableCell className="font-medium">{format(new Date(m.date), 'dd-MM-yyyy')} – {m.time}</TableCell>
                          <TableCell>{m.venue}</TableCell>
                          <TableCell>
                            {m.synopsis ? (
                              <span dangerouslySetInnerHTML={{ __html: m.synopsis.slice(0, 20) + (m.synopsis.length > 20 ? "…" : "") }} />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          {canEdit && (
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(m)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={canEdit ? 4 : 3} className="text-center h-24">
                          No meetings found for the selected committee.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    <MeetingDetailsDialog isOpen={selectedMeeting !== null} onClose={handleCloseDetails} meeting={selectedMeeting} />
    <EditMeetingDialog isOpen={editingMeeting !== null} onClose={handleCloseEdit} meeting={editingMeeting} />
    </>
  );
}

