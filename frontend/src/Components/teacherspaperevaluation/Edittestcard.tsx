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
import { usePostData } from "@/components/HTTP/POST";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [examCalendars, setExamCalendars] = useState<ExamCalendar[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [paperEvaluations, setPaperEvaluations] = useState<PaperEvaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<PaperEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvaluation, setEditingEvaluation] = useState<PaperEvaluation | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [completedPapersInput, setCompletedPapersInput] = useState<string>("0");
  const [searchSubject, setSearchSubject] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  useEffect(() => {
    let filtered = paperEvaluations;
    
    if (selectedStaffId !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.staff_id === parseInt(selectedStaffId));
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status === selectedStatus);
    }
    
    if (searchSubject) {
      filtered = filtered.filter(evaluation => {
        const subject = subjects.find(s => s.id === evaluation.subject_id);
        return subject?.subject_name.toLowerCase().includes(searchSubject.toLowerCase());
      });
    }
    
    setFilteredEvaluations(filtered);
  }, [selectedStaffId, selectedStatus, searchSubject, paperEvaluations, subjects]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [examCalendarRes, subjectsRes, staffRes, paperEvaluationsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/exam-calendars', config),
        axios.get('http://localhost:8000/api/subjects', config),
        axios.get('http://localhost:8000/api/staff', config),
        axios.get('http://localhost:8000/api/paper-evaluations', config),
      ]);

      setExamCalendars(examCalendarRes.data.data?.ExamCalendar || []);
      setSubjects(subjectsRes.data.data?.Subject || []);
      setStaff(staffRes.data.data?.Staff || []);
      setPaperEvaluations(paperEvaluationsRes.data.data || []);
      setFilteredEvaluations(paperEvaluationsRes.data.data || []); // Set initial filtered data
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'vice-principal') {
      if (selectedStaffId === 'all') {
        setFilteredEvaluations(paperEvaluations);
      } else {
        const filtered = paperEvaluations.filter(
          (evaluation) => evaluation.staff_id === parseInt(selectedStaffId, 10)
        );
        setFilteredEvaluations(filtered);
      }
    }
  }, [selectedStaffId, paperEvaluations, userRole]);

  useEffect(() => {
    const filtered = paperEvaluations.filter(
      (evaluation) => evaluation.subject?.subject_name?.toLowerCase().includes(searchSubject.toLowerCase())
    );
    setFilteredEvaluations(filtered);
  }, [searchSubject, paperEvaluations]);

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
      },
      onError: (error: any) => {
        console.error("Error creating paper evaluation:", error);
        toast.error("Failed to create paper evaluation");
      }
    }
  });

  const handleEditClick = (evaluation: PaperEvaluation) => {
    setEditingEvaluation(evaluation);
    setCompletedPapersInput(evaluation.completed_papers.toString());
  };

  const handleCloseDialog = () => {
    setEditingEvaluation(null);
  };

  const handleUpdateCompletedPapers = async () => {
    if (editingEvaluation) {
      const updatedEvaluation = { 
        ...editingEvaluation, 
        completed_papers: parseInt(completedPapersInput, 10) || 0,
        status: parseInt(completedPapersInput, 10) >= editingEvaluation.total_papers ? 'completed' : (parseInt(completedPapersInput, 10) > 0 ? 'in_progress' : 'assigned')
      };
      try {
        await axios.put(`/api/paper-evaluations/${editingEvaluation.id}`, updatedEvaluation);
        handleCloseDialog();
        // Reload the page to reflect latest data as requested
        window.location.reload();
      } catch (error) {
        console.error("Failed to update completed papers:", error);
        // Removed alert as requested
      }
    }
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
      // Refresh data
      const paperEvaluationsRes = await axios.get('http://localhost:8000/api/paper-evaluations');
      setPaperEvaluations(paperEvaluationsRes.data.data || []);
      form.reset(defaultValues);
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>Paper Evaluations</CardTitle>
              <CardDescription>List of all paper evaluations {userRole === 'admin' ? 'for Admin' : (filteredEvaluations.length > 0 && filteredEvaluations[0].staff ? `for ${filteredEvaluations[0].staff.name}` : '')}.</CardDescription>
            </div>
            <div className="flex gap-4 items-center">
              {(userRole === 'admin' || userRole === 'vice-principal') && (
                <div className="w-1/4 min-w-[200px]">
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="w-1/4 min-w-[200px]">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/4 min-w-[200px]">
                <Input
                  placeholder="Search by Subject"
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Papers</TableHead>
                <TableHead>Completed Papers</TableHead>
                <TableHead>Remaining Papers</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((evaluation: PaperEvaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>{evaluation.exam_calendar?.exam_name || 'N/A'}</TableCell>
                    <TableCell>{evaluation.subject?.subject_name || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(evaluation.due_date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{evaluation.total_papers}</TableCell>
                    <TableCell>{evaluation.completed_papers}</TableCell>
                    <TableCell>{evaluation.total_papers - evaluation.completed_papers}</TableCell>
                    <TableCell>
                      <GaugeChart value={evaluation.completed_papers} total={evaluation.total_papers} />
                    </TableCell>
                    <TableCell>
                      {evaluation.status === 'assigned' ? 'Assigned' : 
                       evaluation.status === 'in_progress' ? 'In Progress' : 
                       evaluation.status === 'completed' ? 'Completed' : evaluation.status}
                    </TableCell>
                    <TableCell>
                      <Dialog open={editingEvaluation?.id === evaluation.id} onOpenChange={() => handleEditClick(evaluation)}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Edit</Button>
                        </DialogTrigger>
                        {editingEvaluation?.id === evaluation.id && (
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle>Update Completed Papers</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Total Papers : {editingEvaluation.total_papers}</label>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Completed Papers</label>
                                <Input 
                                  value={completedPapersInput} 
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Only update if value is empty or between 0 and total_papers
                                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= editingEvaluation.total_papers)) {
                                      setCompletedPapersInput(value);
                                    }
                                  }} 
                                  type="number" 
                                  max={editingEvaluation.total_papers}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                                <Button onClick={handleUpdateCompletedPapers}>Update</Button>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
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
    </div>
  );
}

export default PaperEvaluationForm;
