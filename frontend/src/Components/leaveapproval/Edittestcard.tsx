import { useState, useEffect } from "react";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetData } from "@/Components/HTTP/GET";
import { usePutData } from "@/Components/HTTP/PUT";

// Define the type for a leave application
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

function LeaveApprovalDashboard() {
  const navigate = useNavigate();
  
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApplication[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveApplication[]>([]);
  const [rejectedLeaves, setRejectedLeaves] = useState<LeaveApplication[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  
  // For approval/rejection dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For details dialog
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedLeaveDetails, setSelectedLeaveDetails] = useState<LeaveApplication | null>(null);

  // Use the GET hook for pending leaves
  const { 
    data: pendingLeavesData, 
    isLoading: isLoadingPending,
    refetch: refetchPendingLeaves
  } = useGetData({
    endpoint: '/api/leaves/status/pending',
    params: {
      queryKey: ['leaves-pending'],
      onSuccess: (data: any) => {
        if (data && data.data && data.data.Leave && Array.isArray(data.data.Leave)) {
          // Access the Leave array from the response based on the updated LeaveController format
          console.log("Loaded pending leaves:", data.data.Leave);
          setPendingLeaves(data.data.Leave);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Fallback to the old format if needed
          console.log("Loaded pending leaves (old format):", data.data);
          setPendingLeaves(data.data);
        } else {
          console.log("No pending leaves found or invalid format:", data);
          setPendingLeaves([]);
        }
      },
      onError: (error) => {
        console.error("Error fetching pending leaves:", error);
        toast.error("Failed to fetch pending leaves");
        setPendingLeaves([]);
      }
    }
  });

  // Use the GET hook for approved leaves
  const { 
    data: approvedLeavesData, 
    isLoading: isLoadingApproved,
    refetch: refetchApprovedLeaves
  } = useGetData({
    endpoint: '/api/leaves/status/approved',
    params: {
      queryKey: ['leaves-approved'],
      onSuccess: (data: any) => {
        if (data && data.data && data.data.Leave && Array.isArray(data.data.Leave)) {
          // Access the Leave array from the response based on the updated LeaveController format
          console.log("Loaded approved leaves:", data.data.Leave);
          setApprovedLeaves(data.data.Leave);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Fallback to the old format if needed
          console.log("Loaded approved leaves (old format):", data.data);
          setApprovedLeaves(data.data);
        } else {
          console.log("No approved leaves found or invalid format:", data);
          setApprovedLeaves([]);
        }
      },
      onError: (error) => {
        console.error("Error fetching approved leaves:", error);
        toast.error("Failed to fetch approved leaves");
        setApprovedLeaves([]);
      }
    }
  });

  // Use the GET hook for rejected leaves
  const { 
    data: rejectedLeavesData, 
    isLoading: isLoadingRejected,
    refetch: refetchRejectedLeaves
  } = useGetData({
    endpoint: '/api/leaves/status/rejected',
    params: {
      queryKey: ['leaves-rejected'],
      onSuccess: (data: any) => {
        if (data && data.data && data.data.Leave && Array.isArray(data.data.Leave)) {
          // Access the Leave array from the response based on the updated LeaveController format
          console.log("Loaded rejected leaves:", data.data.Leave);
          setRejectedLeaves(data.data.Leave);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Fallback to the old format if needed
          console.log("Loaded rejected leaves (old format):", data.data);
          setRejectedLeaves(data.data);
        } else {
          console.log("No rejected leaves found or invalid format:", data);
          setRejectedLeaves([]);
        }
      },
      onError: (error) => {
        console.error("Error fetching rejected leaves:", error);
        toast.error("Failed to fetch rejected leaves");
        setRejectedLeaves([]);
      }
    }
  });

  // Function to get the appropriate loading state based on active tab
  const isLoadingCurrentTab = () => {
    switch (activeTab) {
      case "pending":
        return isLoadingPending;
      case "approved":
        return isLoadingApproved;
      case "rejected":
        return isLoadingRejected;
      default:
        return false;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleBack = () => {
    navigate({ to: "/dashboard" as any });
  };
  
  const handleAction = (leave: LeaveApplication, action: "approve" | "reject") => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks("");
    setIsDialogOpen(true);
  };
  
  // Use PUT hook for updating leave status
  const leaveUpdateMutation = usePutData({
    endpoint: selectedLeave ? `/api/leaves/${selectedLeave.id}` : '/api/leaves/0',
    params: {
      onSuccess: () => {
        const status = actionType === "approve" ? "approved" : "rejected";
        toast.success(`Leave application ${status} successfully`);
        
        // Refresh all lists
        refetchPendingLeaves();
        refetchApprovedLeaves();
        refetchRejectedLeaves();
        
        // Close dialog
        setIsDialogOpen(false);
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error(`Error ${actionType === "approve" ? "approving" : "rejecting"} leave:`, error);
        toast.error(`Failed to ${actionType} leave application`);
        setIsSubmitting(false);
      }
    }
  });
  
  const handleConfirmAction = async () => {
    if (!selectedLeave || !actionType) return;
    
    setIsSubmitting(true);
    
    const status = actionType === "approve" ? "approved" : "rejected";
    
    // Get role and format display text
    const role = localStorage.getItem("role") || "";
    let formattedRole;
    
    if (role === "superadmin") {
      formattedRole = "Super Admin";
    } else if (role === "admin") {
      formattedRole = "Principal";
    } else {
      formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    }
    
    // Prepare update data
    const updateData = {
      status,
      remarks,
      approved_by: formattedRole,
      approved_at: new Date().toISOString(),
    };
    
    // Use the mutation to update the leave
    leaveUpdateMutation.mutate(updateData);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString || "-";
    }
  };
  
  // Format date with time for detailed view
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString || "-";
    }
  };
  
  // Open details dialog
  const handleViewDetails = (leave: LeaveApplication, event?: React.MouseEvent) => {
    // If this is triggered from a button inside a row, stop event propagation
    if (event) {
      event.stopPropagation();
    }
    setSelectedLeaveDetails(leave);
    setIsDetailsDialogOpen(true);
  };
  
  const renderLeaveList = (leaves: LeaveApplication[], showActions = false) => {
    if (isLoadingCurrentTab()) {
      return <div className="flex justify-center py-6">Loading...</div>;
    }
    
    if (!leaves || !Array.isArray(leaves) || leaves.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No leave applications found
        </div>
      );
    }
    
    return (
      <Table>
        <TableCaption>
          {activeTab === "pending" && "Pending leave applications"}
          {activeTab === "approved" && "Approved leave applications"}
          {activeTab === "rejected" && "Rejected leave applications"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Name</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>From Date</TableHead>
            <TableHead>To Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            {activeTab !== "pending" && <TableHead>Remarks</TableHead>}
            {activeTab !== "pending" && <TableHead>Approved By</TableHead>}
            {activeTab !== "pending" && <TableHead>Approved At</TableHead>}
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(leaves) && leaves.map((leave) => (
            <TableRow 
              key={leave.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewDetails(leave)}
            >
              <TableCell>{leave.staff_name || "Staff"}</TableCell>
              <TableCell>{leave.leave_type || "N/A"}</TableCell>
              <TableCell>{formatDate(leave.from_date)}</TableCell>
              <TableCell>{formatDate(leave.to_date)}</TableCell>
              <TableCell>
                <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.reason}>
                  {leave.reason}
                </div>
              </TableCell>
              <TableCell>
                {leave.status === "approved" && (
                  <Badge className="bg-green-500">Approved</Badge>
                )}
                {leave.status === "rejected" && (
                  <Badge className="bg-red-500">Rejected</Badge>
                )}
                {leave.status === "pending" && (
                  <Badge className="bg-yellow-500">Pending</Badge>
                )}
              </TableCell>
              {activeTab !== "pending" && <TableCell>
                <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.remarks || "-"}>
                  {leave.remarks || "-"}
                </div>
              </TableCell>}
              {activeTab !== "pending" && <TableCell>{leave.approved_by || "-"}</TableCell>}
              {activeTab !== "pending" && (
                <TableCell>
                  {leave.approved_at ? formatDate(leave.approved_at) : "-"}
                </TableCell>
              )}
              {showActions && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(leave, "approve");
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(leave, "reject");
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="space-y-6">
       
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Applications</CardTitle>
              <CardDescription>
                Review and manage leave applications awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaveList(pendingLeaves, true)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Leave Applications</CardTitle>
              <CardDescription>
                View previously approved leave applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaveList(approvedLeaves)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Leave Applications</CardTitle>
              <CardDescription>
                View previously rejected leave applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaveList(rejectedLeaves)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Approval/Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] bg-gradient-to-b from-background to-background/95 border-2 border-border/30 backdrop-blur-sm rounded-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">
              {actionType === "approve" ? "Approve Leave" : "Reject Leave"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Approve this leave application with remarks"
                : "Provide a reason for rejecting this leave application"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium text-muted-foreground" htmlFor="remarks">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                className="col-span-3 border-2 shadow-sm focus:shadow-md transition-shadow"
                placeholder="Enter your remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="shadow-md hover:shadow-lg transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isSubmitting || leaveUpdateMutation.isPending}
              className={
                actionType === "approve"
                  ? "bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all"
                  : "shadow-md hover:shadow-lg transition-all"
              }
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {(isSubmitting || leaveUpdateMutation.isPending)
                ? "Processing..."
                : actionType === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Leave Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] bg-gradient-to-b from-background to-background/95 border-2 border-border/30 backdrop-blur-sm rounded-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">Leave Application Details</DialogTitle>
            <DialogDescription>
              Full information about this leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedLeaveDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <div className="font-medium text-muted-foreground">Staff Name:</div>
                <div className="col-span-3 font-semibold">{selectedLeaveDetails.staff_name || "Staff"}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <div className="font-medium text-muted-foreground">Leave Period:</div>
                <div className="col-span-3 font-semibold">
                  {formatDate(selectedLeaveDetails.from_date)} to {formatDate(selectedLeaveDetails.to_date)}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-2">
                <div className="font-medium text-muted-foreground">Reason:</div>
                <div className="col-span-3 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto pr-2">{selectedLeaveDetails.reason}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <div className="font-medium text-muted-foreground">Status:</div>
                <div className="col-span-3">
                  {selectedLeaveDetails.status === "approved" && (
                    <Badge className="bg-green-500 shadow-sm">Approved</Badge>
                  )}
                  {selectedLeaveDetails.status === "rejected" && (
                    <Badge className="bg-red-500 shadow-sm">Rejected</Badge>
                  )}
                  {selectedLeaveDetails.status === "pending" && (
                    <Badge className="bg-yellow-500 shadow-sm">Pending</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-2">
                <div className="font-medium text-muted-foreground">Remarks:</div>
                <div className="col-span-3 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto pr-2">{selectedLeaveDetails.remarks || "-"}</div>
              </div>
              
              {selectedLeaveDetails.status !== "pending" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <div className="font-medium text-muted-foreground">Approved By:</div>
                    <div className="col-span-3 font-semibold">{selectedLeaveDetails.approved_by || "-"}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-2">
                    <div className="font-medium text-muted-foreground">Approved At:</div>
                    <div className="col-span-3">{formatDateTime(selectedLeaveDetails.approved_at)}</div>
                  </div>
                </>
              )}
              
              {selectedLeaveDetails.status === "pending" && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      // Small delay to avoid visual glitch with dialogs
                      setTimeout(() => {
                        handleAction(selectedLeaveDetails, "approve");
                      }, 100);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      // Small delay to avoid visual glitch with dialogs
                      setTimeout(() => {
                        handleAction(selectedLeaveDetails, "reject");
                      }, 100);
                    }}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="border-t pt-4">
            <Button 
              onClick={() => setIsDetailsDialogOpen(false)} 
              variant="outline"
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

export default function LeaveApprovalPage() {
  return (
    <div className="container mx-auto py-10">
      <LeaveApprovalDashboard />
    </div>
  );
}

