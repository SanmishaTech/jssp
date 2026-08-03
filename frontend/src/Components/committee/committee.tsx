import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useGetData } from "@/Components/HTTP/GET";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import MeetingDetailsDialog from "@/Components/meetings/MeetingDetailsDialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Committee() {
  const params = useParams({ strict: false }) as { id: string };
  const { id } = params;

  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  const committeeQuery = useGetData({
    endpoint: `/api/committee/${id}`,
    params: { queryKey: ["committee", id], enabled: !!id },
  });

  const meetingsQuery = useGetData({
    endpoint: `/api/committee-meetings?committee_id=${id}`,
    params: { queryKey: ["committeeMeetings", id], enabled: !!id },
  });

  const committee = useMemo(() => {
    return (committeeQuery.data as any)?.data?.Committee || null;
  }, [committeeQuery.data]);

  const meetings = useMemo(() => {
    return (meetingsQuery.data as any)?.data?.meetings || [];
  }, [meetingsQuery.data]);

  const handleRowClick = (meeting: any) => setSelectedMeeting(meeting);
  const handleCloseDetails = () => setSelectedMeeting(null);

  if (committeeQuery.isLoading) return <div>Loading...</div>;
  if (committeeQuery.isError) return <div>Error loading committee details.</div>;
  if (!committee) return <div>No committee data found.</div>;

  return (
    <>
      <div className="@container/committee-detail min-w-0 w-full px-4 py-4 @[700px]/committee-detail:px-6 @[700px]/committee-detail:py-6">
        <div className="mx-auto min-w-0 w-full max-w-4xl rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800 @[700px]/committee-detail:p-8">
          {/* Committee Details */}
          <div className="mb-6 flex min-w-0 flex-col gap-4 @[480px]/committee-detail:flex-row @[480px]/committee-detail:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {committee.commitee_name?.charAt(0) || "C"}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="mb-1 truncate text-xl font-bold text-gray-900 dark:text-white @[700px]/committee-detail:text-2xl">
                {committee.commitee_name}
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Institute: <span className="font-medium">{committee.institute_name}</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="members" className="min-w-0 w-full">
            <TabsList className="mb-6 grid w-full max-w-md grid-cols-1 mx-auto @[480px]/committee-detail:grid-cols-2">
              <TabsTrigger value="members">Committee Members</TabsTrigger>
              <TabsTrigger value="meetings">Meeting History</TabsTrigger>
            </TabsList>

            {/* Committee Members Tab */}
            <TabsContent value="members">
              <div className="min-w-0 overflow-x-auto rounded-md border">
                <Table className="min-w-[480px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Designation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {committee.staff && committee.staff.length > 0 ? (
                      committee.staff.map((s: any) => (
                        <TableRow key={s.staff_name ?? s.staff_id}>
                          <TableCell>{s.staff_name ?? (s.role === 'admin' ? 'Principal' : s.role ?? '-')}</TableCell>
                          <TableCell>{s.role ?? '-'}</TableCell>
                          <TableCell>{s.designation}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No members found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Meeting History Tab */}
            <TabsContent value="meetings">
              {meetingsQuery.isLoading ? (
                <div className="min-w-0 overflow-x-auto rounded-md border">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date & Time</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Synopsis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : meetingsQuery.isError ? (
                <div className="flex items-center justify-center h-24 text-center text-destructive border rounded-md">
                  <p>Failed to load meetings.</p>
                </div>
              ) : meetings.length > 0 ? (
                <div className="min-w-0 overflow-x-auto rounded-md border">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date & Time</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Synopsis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings.map((m: any) => (
                        <TableRow key={m.id} onClick={() => handleRowClick(m)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{format(new Date(m.date), 'dd-MM-yyyy')} – {m.time}</TableCell>
                          <TableCell>{m.venue}</TableCell>
                          <TableCell>
                            {m.synopsis ? (
                              <div className="prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: m.synopsis.slice(0, 70) + (m.synopsis.length > 70 ? "…" : "") }} />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-center text-muted-foreground border rounded-md">
                  <p>No meetings found for this committee.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <MeetingDetailsDialog isOpen={!!selectedMeeting} onClose={handleCloseDetails} meeting={selectedMeeting} />
    </>
  );
}
