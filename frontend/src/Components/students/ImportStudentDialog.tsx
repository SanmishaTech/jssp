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
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [errorRows, setErrorRows] = useState<number[]>([]);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "partial" | "error"
  >("idle");

  const onClose = () => {
    onOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Reset error states
    setImportErrors([]);
    setErrorRows([]);
    setImportStatus("idle");
  };

  const handleDownloadTemplate = () => {
    const token = localStorage.getItem("token");
    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = `${axios.defaults.baseURL}/api/students/download-template`;
    link.setAttribute("download", "students.xlsx");
    link.setAttribute("target", "_blank");
    // Add the token to the request headers
    fetch(link.href, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading template:", error);
        toast.error("Failed to download template");
      });
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
      const response = await axios.post("/api/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data;

      // Check if there are errors in the response
      if (responseData.data?.errors && responseData.data.errors.length > 0) {
        // Store errors in state to display in dialog
        setImportErrors(responseData.data.errors);

        // Store error rows if available
        if (
          responseData.data?.errorRows &&
          responseData.data.errorRows.length > 0
        ) {
          setErrorRows(responseData.data.errorRows);
        }

        // If no students were imported, show error status
        if (responseData.data.count === 0) {
          setImportStatus("error");
          toast.error(responseData.message || "No students were imported");
        } else {
          // Some students were imported despite errors
          setImportStatus("partial");
          toast.warning(responseData.message);
        }
      } else {
        // Success with no errors
        toast.success(responseData.message || "Students imported successfully");
        setImportStatus("success");
        onClose();
        fetchData();
      }
    } catch (error) {
      console.error("Error importing students:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        // Check if there are specific errors to display
        if (errorData.data?.errors && errorData.data.errors.length > 0) {
          // Store errors in state to display in dialog
          setImportErrors(errorData.data.errors);

          // Store error rows if available
          if (
            errorData.data?.errorRows &&
            errorData.data.errorRows.length > 0
          ) {
            setErrorRows(errorData.data.errorRows);
          }

          setImportStatus("error");
        } else {
          setImportErrors([errorData.message || "Failed to import students"]);
          setImportStatus("error");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      size="sm"
      className="max-w-[400px] mx-auto"
      backdrop={backdrop}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Import Students
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {importStatus === "idle" || importStatus === "success" ? (
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
                      Please upload an Excel file with student data. Download
                      the template for the correct format.
                    </p>
                    <div className="mt-2">
                      {/* <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Template
                      </button> */}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div
                      className={`p-3 rounded-md ${importStatus === "error" ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}
                    >
                      <h3
                        className={`text-sm font-semibold mb-2 ${importStatus === "error" ? "text-red-700" : "text-yellow-700"}`}
                      >
                        {importStatus === "error"
                          ? "Import Failed"
                          : "Partial Import Success"}
                      </h3>
                      {errorRows.length > 0 && (
                        <p className="text-sm font-medium mb-2">
                          Errors found on rows
                          {/* {errorRows.join(', ')} */}
                        </p>
                      )}
                      <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md bg-white">
                        <ul className="divide-y divide-gray-200">
                          {importErrors.map((error, index) => (
                            <li key={index} className="px-3 py-2 text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              {importStatus === "error" || importStatus === "partial" ? (
                <>
                  <Button color="primary" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={() => {
                      onClose();
                      // If there was a partial success, refresh the data
                      if (importStatus === "partial") {
                        fetchData();
                      }
                    }}
                  >
                    Fix Errors
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
