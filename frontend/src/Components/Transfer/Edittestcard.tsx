import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Transfer {
  id: number;
  inventory_id: number;
  quantity: number;
  from_room_id: number | null;
  from_institute_id: number | null;
  to_room_id: number | null;
  to_institute_id: number | null;
  status: "pending" | "approved" | "rejected";
  requested_by: number;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
}

export default function Edittestcard() {
  const [pending, setPending] = useState<Transfer[]>([]);
  const [history, setHistory] = useState<Transfer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryDetails, setInventoryDetails] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchTransfers = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        axios.get("/api/transfers", {
          params: { status: "pending" },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/transfers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPending(pendingRes.data.data.Transfers);
      setHistory(
        historyRes.data.data.Transfers.filter(
          (t: Transfer) => t.status !== "pending"
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load transfers");
    }
  };

  useEffect(() => {
    fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventoryDetails = async (inventoryId: number) => {
    setLoadingInventory(true);
    try {
      const res = await axios.get(`/api/inventory/${inventoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventoryDetails(res.data.data.Inventory || res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleViewInventory = (inventoryId: number) => {
    fetchInventoryDetails(inventoryId);
    setDialogOpen(true);
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await axios.post(`/api/transfers/${id}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Transfer ${action}d`);
      fetchTransfers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${action}`);
    }
  };

  const getStatusBadge = (status: Transfer["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Transfers</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Inventory Name</TableHead>
                    <TableHead>Quantity</TableHead>
                   
                    <TableHead>To Institute</TableHead>
                    <TableHead>To Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.length > 0 ? (
                    pending.map((t) => (
                      <TableRow key={t.id}>
                         <TableCell>{t.asset_master_name}</TableCell>
                        <TableCell>{t.quantity}</TableCell>
                         <TableCell>{t.to_institute_id || "N/A"}</TableCell>
                        <TableCell>{t.to_room_id || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(t.status)}</TableCell>
                        <TableCell>
                          {new Date(t.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewInventory(t.inventory_id)}
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(t.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(t.id, "reject")}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center">
                        No pending transfers.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Inventory ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>From Institute</TableHead>
                    <TableHead>From Room</TableHead>
                    <TableHead>To Institute</TableHead>
                    <TableHead>To Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length > 0 ? (
                    history.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.id}</TableCell>
                        <TableCell>{t.inventory_id}</TableCell>
                        <TableCell>{t.quantity}</TableCell>
                        <TableCell>{t.from_institute_id || "N/A"}</TableCell>
                        <TableCell>{t.from_room_id || "N/A"}</TableCell>
                        <TableCell>{t.to_institute_id || "N/A"}</TableCell>
                        <TableCell>{t.to_room_id || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(t.status)}</TableCell>
                        <TableCell>
                          {
                            t.approved_at
                              ? new Date(t.approved_at).toLocaleDateString()
                              : new Date(t.created_at).toLocaleDateString()
                          }
                        </TableCell>
                        <TableCell>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewInventory(t.inventory_id)}
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">
                        No transfer history.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inventory Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected inventory item.
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          {loadingInventory ? (
            <div className="py-6 text-center">Loading...</div>
          ) : inventoryDetails ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-3 gap-x-4 gap-y-3 items-center">
                {Object.entries(inventoryDetails).map(([key, value]) => {
                const formatValue = (val: any): string => {
                  if (Array.isArray(val)) {
                    return val
                      .map((v) =>
                        typeof v === "object" && v !== null
                          ? (v.label ?? "")
                          : String(v)
                      )
                      .filter((s) => s.length > 0)
                      .join(", ");
                  }
                  if (typeof val === "object" && val !== null) {
                    if (val.label) return String(val.label);
                    return "";
                  }
                  return String(val);
                };

                const formatKey = (k: string): string =>
                  k
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                const formatted = formatValue(value);
                if (!formatted) return null;

                return (
                  <React.Fragment key={key}>
                    <span className="col-span-1 font-semibold text-gray-500 text-right">
                      {formatKey(key)}
                    </span>
                    <span className="col-span-2 text-gray-800 whitespace-pre-wrap">
                      {formatted}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          ) : (
            <div className="py-6 text-center">No details available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
