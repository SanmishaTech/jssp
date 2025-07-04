import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "../ui/combobox";
import { MoveLeft } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePostData } from "@/Components/HTTP/POST";
import { useGetData } from "@/Components/HTTP/GET";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Define the type for a leave application
interface LeaveApplication {
  id: number;
  from_date: string;
  to_date: string;
  leave_type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string;
  approved_by: string;
  approved_at: string;
}

// Simple interface for institute data
interface Institute {
  id: number;
  name: string;
}

const leaveFormSchema = z.object({
  from_date: z.string().nonempty("From date is required"),
  to_date: z.string().nonempty("To date is required"),
  leave_type: z.string().nonempty("Leave type is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  institute_id: z.number().optional()
}).refine(
  (data) => data.to_date >= data.from_date,
  {
    message: "To date must be after or equal to from date",
    path: ["to_date"],
  }
);

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

function LeaveForm() {
  const defaultValues: Partial<LeaveFormValues> = {
    from_date: "",
    to_date: "",
    leave_type: "",
    reason: "",
    institute_id: undefined
  };
  
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstituteSelector, setShowInstituteSelector] = useState(false);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  
  // Add state for dialog
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authenticated. Please login again.");
     }
  }, [navigate]);
  
  // Handle institute-related errors
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        // This is a simplified example - you should use your actual API endpoint
        const response = await fetch('/api/institutes');
        const data = await response.json();
        
        if (data && data.data) {
          setInstitutes(data.data);
          // Auto-select first institute if available
          if (data.data.length > 0) {
            form.setValue('institute_id', data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching institutes:", error);
        // Create some sample institutes for testing
        const sampleInstitutes = [
          { id: 1, name: "Institute 1" },
          { id: 2, name: "Institute 2" },
          { id: 3, name: "Institute 3" }
        ];
        setInstitutes(sampleInstitutes);
        form.setValue('institute_id', 1);
      }
    };
    
    if (showInstituteSelector) {
      fetchInstitutes();
    }
  }, [showInstituteSelector, form]);
  
  // Use the POST hook for leave application submission
  const leaveSubmitMutation = usePostData({
    endpoint: '/api/leaves',
    params: {
      onSuccess: (response) => {
        toast.success("Leave application submitted successfully");
        form.reset(defaultValues);
        setShowInstituteSelector(false);
        // Refresh leave history after successful submission
        refetchLeaveHistory();
      },
      onError: (error) => {
        console.error("Error submitting leave application:", error);
        
        // Show more detailed error message
        if (error.response) {
          const { status, data } = error.response;
          console.error(`Status: ${status}, Error:`, data);
          
          if (status === 401) {
            toast.error("Your session has expired. Please login again.");
            localStorage.removeItem("token");
             return;
          }
          
          if (status === 400 && data.message === "User does not have an associated institute") {
            toast.error("Your account doesn't have an institute assigned. Please select one below.");
            setShowInstituteSelector(true);
            return;
          }
          
          if (data && data.message) {
            toast.error(data.message);
          } else if (data && data.error) {
            toast.error(data.error);
          } else {
            toast.error("Failed to submit leave application");
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          toast.error("No response received from server");
        } else {
          toast.error("Failed to submit leave application: " + error.message);
        }
      }
    }
  });
  
  async function onSubmit(data: LeaveFormValues) {
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication token is missing. Please login again.");
        setIsSubmitting(false);
        return;
      }
      
      // Get default institute ID for testing purposes if available
      const defaultInstituteId = localStorage.getItem("institute_id") || 
                               localStorage.getItem("default_institute_id");
      
      // Get staff_id from localStorage if available
      const staffId = localStorage.getItem("staff_id");
      
      const formData = {
        ...data,
        date: today,
        status: "pending",
        remarks: "",
        approved_by: "",
        approved_at: "",
        staff_id: staffId ? parseInt(staffId, 10) : null // Include staff_id in the request
      };
      
      // Add institute_id to request if available, as a fallback
      if (defaultInstituteId) {
        formData.institute_id = parseInt(defaultInstituteId, 10);
      }
      
      console.log("Submitting leave application:", formData);
      
      // Use the mutation to submit the form
      leaveSubmitMutation.mutate(formData);
    } catch (error) {
      console.error("Error preparing leave application data:", error);
      toast.error("Failed to prepare leave application data");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const [leaveHistory, setLeaveHistory] = useState<LeaveApplication[]>([]);
  
  // Use the GET hook for fetching leave history
  const { 
    data: leaveHistoryData, 
    isLoading: isLoadingHistory,
    refetch: refetchLeaveHistory
  } = useGetData({
    endpoint: '/api/leaves/member',
    params: {
      queryKey: ['leave-history'],
      onSuccess: (data: any) => {
        if (data && data.data && data.data.Leave && Array.isArray(data.data.Leave)) {
          // Access the Leave array from the response based on the updated LeaveController format
          console.log("Loaded leave history:", data.data.Leave);
          setLeaveHistory(data.data.Leave);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Fallback to the old format if needed
          console.log("Loaded leave history (old format):", data.data);
          setLeaveHistory(data.data);
        } else {
          console.log("No leave history data found or invalid format:", data);
          setLeaveHistory([]);
        }
      },
      onError: (error) => {
        console.error("Error fetching leave history:", error);
        toast.error("Failed to fetch leave history");
        setLeaveHistory([]);
      }
    }
  });
  
  // Load leave history when component mounts
  useEffect(() => {
    refetchLeaveHistory();
  }, [refetchLeaveHistory]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "pending":
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString || "-";
    }
  };
  
  // Format date with time if available
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString || "-";
    }
  };
  
  const handleBack = () => {
    navigate({ to: "/dashboard" as any });
  };
  
  // Open dialog with leave details
  const handleLeaveRowClick = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      
      
      <Tabs defaultValue="apply" className="space-y-4 w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Application</CardTitle>
              <CardDescription>
                Submit your leave application with required details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="from_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>From Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="to_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>To Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="leave_type"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Leave Type</FormLabel>
                          <FormControl>
                            <Combobox
                              options={[
                                { value: "SL", label: "SL - Sick Leave" },
                                { value: "ML", label: "ML - Medical Leave" },
                                { value: "BL", label: "BL - Bereavement Leave" },
                                { value: "CL", label: "CL - Casual Leave" },
                                { value: "SLA", label: "SLA - Special Leave Allowance" },
                                { value: "HDL", label: "HDL - Half Day Leave" },
                                { value: "ODL", label: "ODL - On Duty Leave" },
                                { value: "CO", label: "CO - Compensatory Off" },
                                { value: "BH", label: "BH - Bank Holiday" },
                                { value: "HL", label: "HL - Holiday Leave" }
                              ]}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select Leave Type"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Leave</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide detailed reason for your leave request"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || leaveSubmitMutation.isPending}
                  >
                    {(isSubmitting || leaveSubmitMutation.isPending) 
                      ? "Submitting..." 
                      : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
              <CardDescription>
                View your past and current leave applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center py-6">Loading...</div>
              ) : !leaveHistory || !Array.isArray(leaveHistory) || leaveHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No leave history found</p>
                  <Button 
                    onClick={() => {
                      console.log("Manually refreshing leave history");
                      refetchLeaveHistory();
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Refresh History
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={() => refetchLeaveHistory()}
                    variant="outline"
                    className="mb-4"
                  >
                    Refresh
                  </Button>
                  <Table>
                    <TableCaption>Your leave applications</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>From Date</TableHead>
                        <TableHead>To Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(leaveHistory) && leaveHistory.map((leave) => (
                        <TableRow 
                          key={leave.id} 
                          onClick={() => handleLeaveRowClick(leave)} 
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell>{leave.leave_type}</TableCell>
                          <TableCell>{formatDate(leave.from_date)}</TableCell>
                          <TableCell>{formatDate(leave.to_date)}</TableCell>
                          <TableCell>
                            <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.reason}>
                              {leave.reason}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          <TableCell>
                            <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.remarks || "-"}>
                              {leave.remarks || "-"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Leave Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] bg-gradient-to-b from-background to-background/95 border-2 border-border/30 backdrop-blur-sm rounded-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">Leave Application Details</DialogTitle>
            <DialogDescription>
              Full information about this leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <div className="font-medium text-muted-foreground">Leave Type:</div>
                <div className="col-span-3 font-semibold">{selectedLeave.leave_type}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <div className="font-medium text-muted-foreground">Period:</div>
                <div className="col-span-3 font-semibold">
                  {formatDate(selectedLeave.from_date)} to {formatDate(selectedLeave.to_date)}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-2">
                <div className="font-medium text-muted-foreground">Reason:</div>
                <div className="col-span-3 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto pr-2">{selectedLeave.reason}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <div className="font-medium text-muted-foreground">Status:</div>
                <div className="col-span-3">{getStatusBadge(selectedLeave.status)}</div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-2">
                <div className="font-medium text-muted-foreground">Remarks:</div>
                <div className="col-span-3 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto pr-2">{selectedLeave.remarks || "-"}</div>
              </div>
              
              {selectedLeave.approved_by && (
                <>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <div className="font-medium text-muted-foreground">Approved By:</div>
                    <div className="col-span-3 font-semibold">{selectedLeave.approved_by}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-2">
                    <div className="font-medium text-muted-foreground">Approved At:</div>
                    <div className="col-span-3">{formatDateTime(selectedLeave.approved_at)}</div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="border-t pt-4">
            <Button 
              onClick={() => setDialogOpen(false)} 
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LeaveApplicationPage() {
  return (
    <div className="container mx-auto py-10">
      <LeaveForm />
    </div>
  );
}
