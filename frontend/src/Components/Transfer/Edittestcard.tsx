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
      const res = await axios.get(`/api/inventories/${inventoryId}`, {
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
                    <TableHead>ID</TableHead>
                    <TableHead>Inventory ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>From Institute</TableHead>
                    <TableHead>From Room</TableHead>
                    <TableHead>To Institute</TableHead>
                    <TableHead>To Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.length > 0 ? (
                    pending.map((t) => (
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
                          {new Date(t.created_at).toLocaleDateString()}
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inventory Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected inventory item.
            </DialogDescription>
          </DialogHeader>
          {loadingInventory ? (
            <div className="py-6 text-center">Loading...</div>
          ) : inventoryDetails ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(inventoryDetails).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">No details available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
