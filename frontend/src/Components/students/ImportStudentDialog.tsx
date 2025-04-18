import React, { useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import axios from "axios";
import { toast } from "sonner";

interface ImportStudentDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
}

export default function ImportStudentDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
}: ImportStudentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onClose = () => {
    onOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Use a direct window.open approach to avoid Axios issues
      window.open(`/api/students/template?token=${token}`, '_blank');
    } catch (error) {
      console.error("Error initiating template download:", error);
      toast.error("Failed to download template");
    }
  };

  const handleImport = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast.error("Please select a file to import");
      return;
    }

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Students imported successfully");
      onClose();
      fetchData();
    } catch (error) {
      console.error("Error importing students:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        toast.error(errorData.message || "Failed to import students");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal size="sm" className="max-w-[400px] mx-auto" backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Import Students
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Upload Excel File
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Please upload an Excel file with student data. Download the template for the correct format.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleDownloadTemplate}>
                Download Template
              </Button>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleImport}
                isLoading={isUploading}
                isDisabled={isUploading}
              >
                Import
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
