import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, Send, Clock, CheckCircle, XCircle, CalendarClock, ShieldCheck } from "lucide-react";
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
import axios from "axios";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema
const formSchema = z.object({
  asset_master_id: z.string().min(1, { message: "Asset is required" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }).max(500),
});

// Types
interface Requisition {
  id: string;
  asset_master_id: string;
  asset_name: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  requested_by: string;
  requester_name: string;
  created_at: string;
  approved_by: string | null;
  approver_name: string | null;
  approval_date: string | null;
  comments: string | null;
}

interface Asset {
  id: number;
  institute_id: number;
  asset_category_ids: string;
  asset_type: string;
  service_required: boolean;
  created_at: string;
  updated_at: string;
}

export default function RequisitionManagement() {
  const navigate = useNavigate();
  
  // Get user role from localStorage/sessionStorage or API
  const [userRole, setUserRole] = useState<string>("");
  
  // Fetch user role on component mount
  useEffect(() => {
    // Get user role from localStorage/sessionStorage 
    // Adjust this based on how your application stores auth data
    const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  
  // Check user roles for appropriate access
  const isAdmin = ["admin", "viceprincipal"].includes(userRole);
  const isSuperAdmin = userRole === "superadmin";
  const hasApprovalAccess = isAdmin || isSuperAdmin;
  
  // State
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "approval" : "create");
  const [adminSubTab, setAdminSubTab] = useState("all");
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  
  // Dialog states
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");
  const [approvalComment, setApprovalComment] = useState("");
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset_master_id: "",
      description: "",
    },
  });
  
  // Fetch requisitions
  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      
      switch (activeTab) {
        case "create":
          endpoint = "/api/requisitions?status=pending";
          break;
        case "history":
          endpoint = "/api/requisitions/history";
          break;
        case "approval":
          if (isSuperAdmin) {
            // For superadmin, only show admin requests
            if (adminSubTab === "approved") {
              endpoint = "/api/requisitions/admin?status=approved";
            } else if (adminSubTab === "rejected") {
              endpoint = "/api/requisitions/admin?status=rejected";
            } else {
              endpoint = "/api/requisitions/admin/pending";
            }
          } else if (isAdmin) {
            // For regular admins, show all staff requests
            if (adminSubTab === "approved") {
              endpoint = "/api/requisitions?status=approved";
            } else if (adminSubTab === "rejected") {
              endpoint = "/api/requisitions?status=rejected";
            } else {
              endpoint = "/api/requisitions/pending-approvals";
            }
          } else {
            endpoint = "/api/requisitions?status=pending";
          }
          break;
        default:
          endpoint = "/api/requisitions?status=pending";
      }
      
      console.log('Fetching requisitions from endpoint:', endpoint);
      const response = await axios.get(endpoint);
      console.log('API Response:', response.data);
      
      if (response.data.status) {
        let data;
        if (activeTab === "history") {
          data = response.data.data.History;
        } else if (isAdmin && activeTab === "approval") {
          if (adminSubTab === "all") {
            data = response.data.data.PendingApprovals;
          } else {
            data = response.data.data.Requisition;
          }
        } else {
          data = response.data.data.Requisition;
        }
        
        setRequisitions(data || []);
      }
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      toast.error("Failed to load requisitions");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch assets
  const fetchAssets = async () => {
    try {
      const response = await axios.get("/api/assetmasters");
      if (response.data.status) {
        setAssets(response.data.data.AssetMaster || []);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    }
  };
  
  // Initial load
  useEffect(() => {
    fetchRequisitions();
    fetchAssets();
  }, [activeTab, adminSubTab]);
  
  // Submit form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/requisitions", values);
      if (response.data.status) {
        toast.success("Requisition submitted successfully");
        form.reset();
        fetchRequisitions();
      }
    } catch (error) {
      console.error("Error submitting requisition:", error);
      toast.error("Failed to submit requisition");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle approval/rejection
  const handleApproval = async () => {
    if (!selectedRequisition) return;
    
    setLoading(true);
    try {
      const endpoint = approvalAction === "approve" 
        ? `/api/requisitions/${selectedRequisition.id}/approve` 
        : `/api/requisitions/${selectedRequisition.id}/reject`;
      
      const response = await axios.post(endpoint, {
        comments: approvalComment,
      });
      
      if (response.data.status) {
        toast.success(`Requisition ${approvalAction === "approve" ? "approved" : "rejected"} successfully`);
        setApprovalDialogOpen(false);
        setApprovalComment("");
        fetchRequisitions();
      }
    } catch (error) {
      console.error(`Error ${approvalAction}ing requisition:`, error);
      toast.error(`Failed to ${approvalAction} requisition`);
    } finally {
      setLoading(false);
    }
  };
  
  // Open approval dialog
  const openApprovalDialog = (requisition: Requisition, action: "approve" | "reject") => {
    setSelectedRequisition(requisition);
    setApprovalAction(action);
    setApprovalComment("");
    setApprovalDialogOpen(true);
  };
  
  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate({ to: "/dashboards" })} className="mb-2">
            <MoveLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Requisition Management</h1>
        </div>
      </div>

      <Tabs defaultValue={isSuperAdmin ? "approval" : "create"} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-none md:flex">
          {!isSuperAdmin && (
            <>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Create/Send
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" /> History
              </TabsTrigger>
            </>
          )}
          {hasApprovalAccess && (
            <TabsTrigger value="approval" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Approval & Reject
            </TabsTrigger>
          )}
        </TabsList>

        {/* Create/Send Tab - Not visible to superadmin */}
        {!isSuperAdmin && <TabsContent value="create">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle>Submit New Requisition</CardTitle>
                <CardDescription>
                  Fill out this form to request new assets or items. Your request will be reviewed by an administrator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="asset_master_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assets.map((asset) => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                  {asset.asset_type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why you need this asset and any specific requirements"
                              className="min-h-[120px]"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Requisition"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Pending Requisitions Card */}
            <Card>
              <CardHeader>
                <CardTitle>My Pending Requisitions</CardTitle>
                <CardDescription>
                  View your currently pending requisition requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : requisitions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You have no pending requisitions
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.asset_name}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell>{format(new Date(req.created_at), "MMM dd, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>}

        {/* History Tab - Not visible to superadmin */}
        {!isSuperAdmin && <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Requisition History</CardTitle>
              <CardDescription>
                View all your past requisition requests and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : requisitions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No requisition history found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requisitions.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.asset_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.description}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{format(new Date(req.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{req.approver_name || "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.comments || "None"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

        {/* Admin/SuperAdmin Approval Tab */}
        {hasApprovalAccess && (
          <TabsContent value="approval">
            <div className="mb-6">
              <Tabs defaultValue="all" value={adminSubTab} onValueChange={setAdminSubTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Pending
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Approved
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> Rejected
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {adminSubTab === "all" 
                    ? "Pending Approvals" 
                    : adminSubTab === "approved" 
                      ? "Approved Requisitions" 
                      : "Rejected Requisitions"}
                </CardTitle>
                <CardDescription>
                  {adminSubTab === "all" 
                    ? "Review and manage requisition requests from staff" 
                    : `View all ${adminSubTab} requisition requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : requisitions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {adminSubTab === "all" ? "pending" : adminSubTab} requisitions found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Date</TableHead>
                        {adminSubTab !== "all" && <TableHead>Comments</TableHead>}
                        {adminSubTab === "all" && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.asset_name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{req.description}</TableCell>
                          <TableCell>{req.requester_name}</TableCell>
                          <TableCell>{format(new Date(req.created_at), "MMM dd, yyyy")}</TableCell>
                          {adminSubTab !== "all" && (
                            <TableCell className="max-w-[200px] truncate">{req.comments || "None"}</TableCell>
                          )}
                          {adminSubTab === "all" && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-100 hover:bg-green-200 text-green-800"
                                  onClick={() => openApprovalDialog(req, "approve")}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-red-100 hover:bg-red-200 text-red-800"
                                  onClick={() => openApprovalDialog(req, "reject")}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve Requisition" : "Reject Requisition"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Are you sure you want to approve this requisition?"
                : "Please provide a reason for rejecting this requisition."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequisition && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Asset:</div>
                <div>{selectedRequisition.asset_name}</div>
                
                <div className="font-semibold">Description:</div>
                <div className="truncate">{selectedRequisition.description}</div>
                
                <div className="font-semibold">Requested By:</div>
                <div>{selectedRequisition.requester_name}</div>
                
                <div className="font-semibold">Date:</div>
                <div>{format(new Date(selectedRequisition.created_at), "MMM dd, yyyy")}</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {approvalAction === "approve" ? "Comments (Optional)" : "Reason for Rejection"}
                </label>
                <Textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder={
                    approvalAction === "approve"
                      ? "Add any comments about this approval (optional)"
                      : "Please explain why this requisition is being rejected"
                  }
                  className="resize-none min-h-[100px]"
                />
                {approvalAction === "reject" && !approvalComment && (
                  <p className="text-sm text-red-500">
                    A reason is required for rejection
                  </p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproval}
              disabled={loading || (approvalAction === "reject" && !approvalComment)}
              variant={approvalAction === "approve" ? "default" : "destructive"}
            >
              {loading ? "Processing..." : approvalAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
