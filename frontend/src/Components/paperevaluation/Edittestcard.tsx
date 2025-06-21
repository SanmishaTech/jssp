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
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

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
  subject_id: number[];
}

const paperEvaluationFormSchema = z.object({
  exam_calendar_id: z.number({ required_error: "Exam calendar is required" }),
  subject_id: z.number({ required_error: "Subject is required" }),
  staff_id: z.number({ required_error: "Staff is required" }),
  due_date: z.string().nonempty("Due date is required"),
  total_papers: z.number({ required_error: "Total papers is required" }).min(1, "Total papers must be at least 1"),
  completed_papers: z.number().min(0, "Completed papers cannot be negative").optional(),
  status: z.enum(['assigned', 'in_progress', 'completed']).optional(),
}).refine(data => data.completed_papers === undefined || data.completed_papers <= data.total_papers, {
  message: "Completed papers cannot be greater than total papers",
  path: ["completed_papers"],
});

type PaperEvaluationFormValues = z.infer<typeof paperEvaluationFormSchema>;

const GaugeChart = ({ value, total }: { value: number; total: number }) => {
  if (total === 0) {
    return <div>-</div>;
  }
  const percentage = (value / total) * 100;
  const data = [
    { name: 'completed', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];
  const getColorForPercentage = (percentage: number) => {
    // Convert percentage to a value between 0 and 1
    const value = percentage / 100;
    // Define vibrant color stops: dark red at 0%, bright yellow (#FFFF00) at 50%, dark green at 100%
    if (value < 0.5) {
      // Transition from dark red (235,20,20) to bright yellow (255,255,0)
      const red = Math.round(235 + 20 * (value * 2));
      const green = Math.round(20 + 235 * (value * 2));
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Transition from bright yellow (255,255,0) to dark green (20,220,20)
      const red = Math.round(255 - 235 * ((value - 0.5) * 2));
      const green = Math.round(255 - 35 * ((value - 0.5) * 2));
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  return (
    <div style={{ width: '100px', height: '50px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={100} height={50}>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={20}
            outerRadius={30}
            fill="#8884d8"
            paddingAngle={2}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? getColorForPercentage(entry.value) : '#e0e0e0'} 
                stroke={index === 0 ? getColorForPercentage(entry.value) : '#e0e0e0'} 
                strokeWidth={1.5}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '80%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {`${Math.round(percentage)}%`}
      </div>
    </div>
  );
};

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
  const [editingEvaluation, setEditingEvaluation] = useState<PaperEvaluation | null>(null);

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

  useEffect(() => {
    const selectedSubjectId = form.watch('subject_id');
    console.log('Selected Subject ID:', selectedSubjectId);
    if (selectedSubjectId !== 0 && staff.length > 0) {
      // Find a staff member associated with this subject
      // This is placeholder logic - in a real app, you might need an API call to get the exact staff assignment for this subject
      // For now, we'll assume the staff data has some relation or we pick the first matching staff with a subject reference
      const associatedStaff = staff.find(s => {
        // Replace this condition with actual logic based on your data structure
        // For demonstration, let's assume staff with ID matching subject ID or some pattern
        return s.id === selectedSubjectId; 
      });
      if (associatedStaff) {
        console.log('Setting Staff ID to:', associatedStaff.id);
        form.setValue('staff_id', associatedStaff.id);
      } else {
        // If no direct match found, we could leave it unchanged or set to 0
        console.log('No staff associated with this subject found.');
        // form.setValue('staff_id', 0); // Uncomment if you want to reset when no staff is associated
      }
    }
  }, [form.watch('subject_id'), staff, form]);

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

    const handleEditClick = (evaluation: PaperEvaluation) => {
    setEditingEvaluation(evaluation);
    form.reset({
      ...evaluation,
      exam_calendar_id: evaluation.exam_calendar?.id || 0,
      subject_id: evaluation.subject?.id || 0,
      staff_id: evaluation.staff?.id || 0,
    });
    setActiveTab("create");
  };

  const onSubmit = async (data: PaperEvaluationFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingEvaluation) {
        await axios.put(`http://localhost:8000/api/paper-evaluations/${editingEvaluation.id}`, data);
        toast.success("Paper evaluation updated successfully");
        setEditingEvaluation(null);
      } else {
        await paperEvaluationSubmitMutation.mutateAsync(data);
      }
      // Refresh data and switch tab
      const paperEvaluationsRes = await axios.get('http://localhost:8000/api/paper-evaluations');
      setPaperEvaluations(paperEvaluationsRes.data.data || []);
      form.reset(defaultValues);
      setActiveTab("list");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error("Submission error:", errorMessage);
      toast.error(editingEvaluation ? "Failed to update paper evaluation" : "Failed to create paper evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = useMemo(() => {
    return subjects.find(subject => subject.id === form.watch('subject_id'));
  }, [form.watch('subject_id'), subjects]);

  // Filter staff based on selected subject
  const filteredStaff = useMemo(() => {
    if (!selectedSubject) return staff;
    return staff.filter(staff => 
      staff.subject_id && staff.subject_id.includes(selectedSubject.id.toString())
    );
  }, [staff, selectedSubject]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="create">Create Paper Evaluation</TabsTrigger>
            <TabsTrigger value="list">Paper Evaluations List</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[...Array(9)].map((_, i) => (
                          <TableHead key={i}>
                            <Skeleton className="h-5 w-full" />
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(9)].map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
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
              <CardTitle>{editingEvaluation ? 'Edit Paper Evaluation' : 'Create Paper Evaluation'}</CardTitle>
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value, 10) || 0)} value={field.value?.toString() ?? ''}>
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value, 10) || 0)} value={field.value?.toString() ?? ''} disabled={!form.watch('exam_calendar_id')}>
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value, 10) || 0)} value={field.value?.toString() ?? ''}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a staff member" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(filteredStaff) ? filteredStaff.map((staffMember: Staff) => (
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
                    {isSubmitting
                      ? editingEvaluation
                        ? 'Updating...'
                        : 'Creating...'
                      : editingEvaluation
                      ? 'Update Evaluation'
                      : 'Create Evaluation'}
                  </Button>
                  {editingEvaluation && (
                    <Button variant="outline" onClick={() => { setEditingEvaluation(null); form.reset(defaultValues); }}>
                      Cancel
                    </Button>
                  )}
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
                     <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Papers</TableHead>
                    <TableHead>Completed Papers</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(paperEvaluations) && paperEvaluations.length > 0 ? (
                    paperEvaluations.map((evaluation: PaperEvaluation) => (
                      <TableRow key={evaluation.id}>
                         <TableCell>{evaluation.exam_calendar?.exam_name || 'N/A'}</TableCell>
                        <TableCell>{evaluation.subject?.subject_name || 'N/A'}</TableCell>
                        <TableCell>{evaluation.staff?.name || 'N/A'}</TableCell>
                        <TableCell>{format(new Date(evaluation.due_date), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{evaluation.total_papers}</TableCell>
                        <TableCell>{evaluation.completed_papers}</TableCell>
                        <TableCell className="flex justify-center">
                          <GaugeChart value={evaluation.completed_papers} total={evaluation.total_papers} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={evaluation.status === 'completed' ? 'default' : 'secondary'}>
                            {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(evaluation)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">
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
