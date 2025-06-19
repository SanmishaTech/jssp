import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { usePostData } from "@/Components/HTTP/POST";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the type for a paper evaluation
interface PaperEvaluation {
  id: number;
  exam_calendar_id: number;
  exam_calendar: ExamCalendar | null;
  subject_id: number;
  subject: Subject | null;
  staff_id: number;
  staff: Staff | null;
  due_date: string;
  total_papers: number;
  completed_papers: number;
  status: 'assigned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface ExamCalendar {
  id: number;
  exam_name: string;
  date: string;
}

interface Subject {
  id: number;
  subject_name: string;
}

interface Staff {
  id: number;
  name: string;
}

const paperEvaluationFormSchema = z.object({
  exam_calendar_id: z.number({ required_error: "Exam calendar is required" }),
  subject_id: z.number({ required_error: "Subject is required" }),
  staff_id: z.number({ required_error: "Staff is required" }),
  due_date: z.string().nonempty("Due date is required"),
  total_papers: z.number({ required_error: "Total papers is required" }).min(1, "Total papers must be at least 1"),
  completed_papers: z.number().min(0, "Completed papers cannot be negative").optional(),
  status: z.enum(['assigned', 'in_progress', 'completed']).optional(),
});

type PaperEvaluationFormValues = z.infer<typeof paperEvaluationFormSchema>;

function PaperEvaluationForm() {
  const defaultValues: Partial<PaperEvaluationFormValues> = {
    exam_calendar_id: 0,
    subject_id: 0,
    staff_id: 0,
    due_date: "",
    total_papers: 0,
    completed_papers: 0,
    status: "assigned",
  };

  const form = useForm<PaperEvaluationFormValues>({
    resolver: zodResolver(paperEvaluationFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [examCalendars, setExamCalendars] = useState<ExamCalendar[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [paperEvaluations, setPaperEvaluations] = useState<PaperEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data for dropdowns using axios
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [examCalendarRes, subjectsRes, staffRes, paperEvaluationsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/exam-calendars'),
          axios.get('http://localhost:8000/api/subjects'),
          axios.get('http://localhost:8000/api/staff'),
          axios.get('http://localhost:8000/api/paper-evaluations'),
        ]);

        setExamCalendars(examCalendarRes.data.data?.ExamCalendar || []);
        setSubjects(subjectsRes.data.data?.Subject || []);
        setStaff(staffRes.data.data?.Staff || []);
        setPaperEvaluations(paperEvaluationsRes.data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const selectedExamCalendarId = form.watch('exam_calendar_id');
    console.log('Selected Exam Calendar ID:', selectedExamCalendarId);
    if (selectedExamCalendarId !== 0) {
      // Assuming there's a relationship between exam calendar and subject
      // This is placeholder logic - adjust based on your actual data structure or API
      const associatedSubjectId = subjects.length > 0 ? subjects[0].id : 0;
      console.log('Setting Subject ID to:', associatedSubjectId);
      form.setValue('subject_id', associatedSubjectId);
    }
  }, [form.watch('exam_calendar_id'), subjects, form]);

  // Use the POST hook for paper evaluation submission
  const paperEvaluationSubmitMutation = usePostData({
    endpoint: '/api/paper-evaluations',
    params: {
      onSuccess: (response: any) => {
        toast.success("Paper evaluation created successfully");
        form.reset(defaultValues);
        // Refresh paper evaluations
        axios.get('/api/paper-evaluations').then(res => setPaperEvaluations(res.data));
        setActiveTab("list"); // Switch to list tab after successful creation
      },
      onError: (error: any) => {
        console.error("Error creating paper evaluation:", error);
        toast.error("Failed to create paper evaluation");
      }
    }
  });

  const onSubmit = async (data: PaperEvaluationFormValues) => {
    setIsSubmitting(true);
    try {
      await paperEvaluationSubmitMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="create">Create Paper Evaluation</TabsTrigger>
          <TabsTrigger value="list">Paper Evaluations List</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Paper Evaluation</CardTitle>
              <CardDescription>Assign paper evaluations to staff members.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="exam_calendar_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Calendar</FormLabel>
                        <FormControl>
                          <Select {...form.register('exam_calendar_id')} onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={field.value?.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Exam Calendar" />
                            </SelectTrigger>
                            <SelectContent>
                              {examCalendars && examCalendars.map((calendar) => (
                                <SelectItem key={calendar.id} value={calendar.id.toString()}>
                                  {calendar.exam_name}
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
                    name="subject_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Select {...form.register('subject_id')} onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value.toString()} disabled={form.watch('exam_calendar_id') !== 0}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(subjects) ? subjects.map((subject: Subject) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.subject_name}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="staff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff</FormLabel>
                        <FormControl>
                          <Select {...form.register('staff_id')} onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={field.value?.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a staff member" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(staff) ? staff.map((staffMember: Staff) => (
                                <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                                  {staffMember.name}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_papers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Papers</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="completed_papers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completed Papers (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status (Optional)</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Paper Evaluation"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Paper Evaluations</CardTitle>
              <CardDescription>List of all paper evaluations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Papers</TableHead>
                    <TableHead>Completed Papers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(paperEvaluations) && paperEvaluations.length > 0 ? (
                    paperEvaluations.map((evaluation: PaperEvaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>{evaluation.id}</TableCell>
                        <TableCell>{evaluation.exam_calendar?.exam_name || 'N/A'}</TableCell>
                        <TableCell>{evaluation.subject?.subject_name || 'N/A'}</TableCell>
                        <TableCell>{evaluation.staff?.name || 'N/A'}</TableCell>
                        <TableCell>{format(new Date(evaluation.due_date), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{evaluation.total_papers}</TableCell>
                        <TableCell>{evaluation.completed_papers}</TableCell>
                        <TableCell>
                          <Badge variant={evaluation.status === 'completed' ? 'default' : 'secondary'}>
                            {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No paper evaluations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PaperEvaluationForm;
