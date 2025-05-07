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
    
    // Prepare update data
    const updateData = {
      status,
      remarks,
      approved_by: localStorage.getItem("user_name") || "Admin",
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
            <TableRow key={leave.id}>
              <TableCell>{leave.staff_name || "Staff"}</TableCell>
              <TableCell>{formatDate(leave.from_date)}</TableCell>
              <TableCell>{formatDate(leave.to_date)}</TableCell>
              <TableCell>{leave.reason}</TableCell>
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
              {activeTab !== "pending" && <TableCell title={leave.remarks || "-"}>{leave.remarks && leave.remarks.length > 7 ? `${leave.remarks.substring(0, 7)}...` : (leave.remarks || "-")}</TableCell>}
              {activeTab !== "pending" && <TableCell>{leave.approved_by || "-"}</TableCell>}
              {activeTab !== "pending" && (
                <TableCell>
                  {leave.approved_at ? formatDate(leave.approved_at) : "-"}
                </TableCell>
              )}
              {showActions && (
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleAction(leave, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(leave, "reject")}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
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
              <Label className="text-right" htmlFor="remarks">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                className="col-span-3"
                placeholder="Enter your remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isSubmitting || leaveUpdateMutation.isPending}
              className={
                actionType === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : ""
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

