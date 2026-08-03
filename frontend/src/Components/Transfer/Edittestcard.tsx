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
    <div className="@container/transfer min-w-0 w-full bg-background/30">
      <div className="flex flex-col gap-4 px-4 py-4 @[700px]/transfer:gap-6 @[700px]/transfer:px-6 @[700px]/transfer:py-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight @[700px]/transfer:text-2xl">
            Transfers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground @[700px]/transfer:text-base">
            Review pending transfer requests and history
          </p>
        </div>

        <Tabs defaultValue="pending" className="min-w-0 w-full">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 @[480px]/transfer:grid-cols-2">
            <TabsTrigger value="pending" className="w-full">
              Pending Transfers
            </TabsTrigger>
            <TabsTrigger value="history" className="w-full">
              Transfer History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <Card className="min-w-0 overflow-hidden border border-border bg-card shadow-sm">
              <CardHeader className="px-4 @[700px]/transfer:px-6">
                <CardTitle className="text-lg @[700px]/transfer:text-xl">
                  Pending Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 overflow-x-auto p-0">
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="whitespace-nowrap">
                        Inventory Name
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Quantity</TableHead>
                      <TableHead className="whitespace-nowrap">
                        To Institute
                      </TableHead>
                      <TableHead className="whitespace-nowrap">To Room</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Requested At
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Info</TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.length > 0 ? (
                      pending.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="max-w-[180px] truncate">
                            {t.asset_master_name}
                          </TableCell>
                          <TableCell>{t.quantity}</TableCell>
                          <TableCell className="max-w-[140px] truncate">
                            {t.to_institute_id || "N/A"}
                          </TableCell>
                          <TableCell>{t.to_room_id || "N/A"}</TableCell>
                          <TableCell>{getStatusBadge(t.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(t.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleViewInventory(t.inventory_id)
                                    }
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex flex-wrap justify-end gap-2">
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No pending transfers.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="min-w-0 overflow-hidden border border-border bg-card shadow-sm">
              <CardHeader className="px-4 @[700px]/transfer:px-6">
                <CardTitle className="text-lg @[700px]/transfer:text-xl">
                  Transfer History
                </CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 overflow-x-auto p-0">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="whitespace-nowrap">ID</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Inventory ID
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Quantity</TableHead>
                      <TableHead className="whitespace-nowrap">
                        From Institute
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        From Room
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        To Institute
                      </TableHead>
                      <TableHead className="whitespace-nowrap">To Room</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Info</TableHead>
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
                          <TableCell className="whitespace-nowrap">
                            {t.approved_at
                              ? new Date(t.approved_at).toLocaleDateString()
                              : new Date(t.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleViewInventory(t.inventory_id)
                                    }
                                  >
                                    <Info className="h-4 w-4" />
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
          <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto bg-white">
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
              <div className="max-h-[min(24rem,50dvh)] overflow-y-auto">
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[minmax(7rem,1fr)_2fr] sm:items-start">
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
                        <span className="min-w-0 text-left text-sm font-semibold text-gray-500 sm:text-right">
                          {formatKey(key)}
                        </span>
                        <span className="min-w-0 break-words whitespace-pre-wrap text-gray-800">
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
    </div>
  );
}
