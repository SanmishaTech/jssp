import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Spinner,
} from "@heroui/react";
import axios from "axios";

interface TransferDialogProps {
  /** Controls the open / closed state */
  isOpen: boolean;
  /** Callback when open state should change */
  onOpenChange: (open: boolean) => void;
  /** Currently-selected inventory item */
  item: any | null;
}

/**
 * Dialog that performs an inventory transfer to another room / location.  
 * When submitted it POSTs `{ inventory_id, destination_room, quantity }` to `/api/inventory/transfer`.
 *
 * NOTE: API URL & payload fields are assumptions – adjust as needed.
 */
export default function TransferDialog({ isOpen, onOpenChange, item }: TransferDialogProps) {
  const navigate = useNavigate();
  // Form state
  // "room" or "institute"
  const [targetType, setTargetType] = useState<"room" | "institute">("room");
  const [quantity, setQuantity] = useState<string>("1");
  const [targetRoom, setTargetRoom] = useState<string>("");
  const [targetInstitute, setTargetInstitute] = useState<string>("");
  const [rooms, setRooms] = useState<Array<{ id: number; name: string }>>([]);
  const [institutes, setInstitutes] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset when dialog opens / closes
  // Load dropdown data when dialog first opens
  React.useEffect(() => {
    if (isOpen) {
      // fetch rooms
      axios
        .get("/api/rooms", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        .then((res) => {
          const rawRooms = res.data?.data?.Room ?? [];
          const normalized = rawRooms.map((r: any) => ({ id: r.id, name: r.room_number || r.room_name || r.id }));
          setRooms(normalized);
        })
        .catch(() => {});
      // fetch institutes
      axios
        .get("/api/institutes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        .then((res) => {
          const rawInstitutes = res.data?.data?.Institutes ?? [];
          const normalizedInst = rawInstitutes.map((i: any) => ({ id: i.id, name: i.institute_name || i.id }));
          setInstitutes(normalizedInst);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Reset local form state whenever the dialog opens / closes
  React.useEffect(() => {
    if (isOpen) {
      setQuantity("1");
      setError(null);
      setSuccess(null);
      setTargetRoom("");
      setTargetInstitute("");
    }
  }, [isOpen]);

  if (!item) return null;

  const handleSubmit = async () => {
    if (parseInt(quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        inventory_id: item.id,
        target_type: targetType,
        quantity,
      };
      if (targetType === "room") {
        payload.destination_room_id = targetRoom;
      } else {
        payload.destination_institute_id = targetInstitute;
      }
      await axios.post(
        "/api/transfers",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );
      setSuccess("Transfer request submitted");
      // redirect to transfer list page
      navigate({ to: "/transfer" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent className="max-w-md w-full">
        <ModalHeader className="flex flex-col gap-1">
          Transfer Inventory
        </ModalHeader>
        <ModalBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Item: <span className="font-medium">{item.one}</span> (Room {item.two})
            <br />
            Quantity: <span className="font-medium">{item.five || "NA"}</span>
          </p>
          {/* Transfer target selection */}
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="targetType"
                value="room"
                checked={targetType === "room"}
                onChange={() => setTargetType("room")}
                className="accent-primary"
              />
              Room
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="targetType"
                value="institute"
                checked={targetType === "institute"}
                onChange={() => setTargetType("institute")}
                className="accent-primary"
              />
              Institute
            </label>
          </div>
          {/* Destination selector */}
          {targetType === "room" ? (
            <select
              className="border rounded p-2 w-full text-sm"
              value={targetRoom}
              onChange={(e) => setTargetRoom(e.target.value)}
            >
              <option value="">Select room</option>
              {Array.isArray(rooms) && rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="border rounded p-2 w-full text-sm"
              value={targetInstitute}
              onChange={(e) => setTargetInstitute(e.target.value)}
            >
              <option value="">Select institute</option>
              {Array.isArray(institutes) && institutes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          )}
          <Input
            type="number"
            placeholder="Quantity"
            min="1"
            max={item.five ? String(item.five) : undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          {success && <p className="text-success text-sm">{success}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Transfer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
