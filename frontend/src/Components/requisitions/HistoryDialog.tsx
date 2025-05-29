import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

// Interface for the requisition data

interface Requisition {
  id: string;
  asset_master_id: string;
  asset_name: string;
  quantity: string;
  approved_quantity: string | null;
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

interface HistoryDialogProps {
  open: boolean;
  onClose: () => void;
  requisition: Requisition | null;
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  onClose,
  requisition
}) => {
  // If no requisition is provided, don't render
  if (!requisition) return null;

  // Function to render status badge
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
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="bg-white sm:max-w-[600px] shadow-lg transform transition-transform duration-300 hover:scale-105">
        <div className="p-4 bg-gray-100 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-700">Requisition Details</h2>
        </div>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ul className="flex flex-col items-center justify-center space-y-2 list-none">
            <li className="text-sm font-medium text-gray-500">Asset: <span className="font-semibold text-gray-700">{requisition.asset_name}</span></li>
            <li className="text-sm font-medium text-gray-500">Status: <span className="font-semibold text-gray-700">{getStatusBadge(requisition.status)}</span></li>
            <li className="text-sm font-medium text-gray-500">Requested Quantity: <span className="font-semibold text-gray-700">{requisition.quantity}</span></li>
            
            {requisition.status === "approved" && (
              <li className="text-sm font-medium">
                <span className="text-green-600">Approved Quantity:</span>
                <span className="text-green-600 px-2 py-1 rounded-md font-semibold ml-1">
                  {requisition.approved_quantity}
                </span>
              </li>
            )}
            <li className="text-sm font-medium text-gray-500">Requested By: <span className="font-semibold text-gray-700">{requisition.requester_name}</span></li>
            <li className="text-sm font-medium text-gray-500">Request Date: <span className="font-semibold text-gray-700">{format(new Date(requisition.created_at), "MMM dd, yyyy")}</span></li>
            <li className="text-sm font-medium text-gray-500">Approved/Rejected By: <span className="font-semibold text-gray-700">{requisition.approver_name || "N/A"}</span></li>
            <li className="text-sm font-medium text-gray-500">Approval/Rejection Date: <span className="font-semibold text-gray-700">{requisition.approval_date ? format(new Date(requisition.approval_date), "MMM dd, yyyy") : "N/A"}</span></li>
          </ul>
          
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="text-sm">{requisition.description}</p>
          </div>
          
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Comments</h3>
            <p className="text-sm">{requisition.comments || "No comments"}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;