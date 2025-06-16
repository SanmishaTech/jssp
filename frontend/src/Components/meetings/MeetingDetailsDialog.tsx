import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface Meeting {
  id: number;
  venue?: string;
  date?: string;
  time?: string;
  synopsis?: string;
  [key: string]: any; // allow any additional fields
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  meeting?: Meeting | null;
}

export default function MeetingDetailsDialog({ isOpen, onClose, meeting }: Props) {
  if (!meeting) return null;

  const formatValue = (val: any) => {
    if (Array.isArray(val)) {
      // If array of primitives
      if (val.length === 0) return "-";
      if (typeof val[0] !== "object") {
        return val.join(", ");
      }
      // Array of objects – try to extract common fields like name/title
      return val
        .map((obj) => {
          if (!obj || typeof obj !== "object") return String(obj);
          return obj.name || obj.title || obj.staff_name || obj.id;
        })
        .join(", ");
    }
    if (val && typeof val === "object") {
      // Single object – stringify selected fields
      return val.name || val.title || val.staff_name || JSON.stringify(val);
    }
    if (val === null || val === undefined) return "-";
    return String(val);
  };

  const entries = Object.entries(meeting);

  const renderValue = (key: string, value: any) => {
    if (key === "staff") {
      // Expect array of staff objects with name field
      if (Array.isArray(value)) {
        return value
          .map((s) => (s.name || s.staff_name || s.id))
          .join(", ");
      }
    }
    return formatValue(value);
  };

  return (
    <Modal backdrop="blur" size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Meeting Details
            </ModalHeader>
            <ModalBody>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {entries.map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-1">
                    <span className="font-medium capitalize mr-2">{key.replace(/_/g, " ")}</span>
                    <span className="text-right break-words max-w-[60%]">{renderValue(key, value)}</span>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
