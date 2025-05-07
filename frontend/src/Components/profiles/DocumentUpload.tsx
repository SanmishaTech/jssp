import { useState } from "react";
import { X, Upload, File } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";

interface DocumentUploadProps {
  form: UseFormReturn<any>;
  existingDocuments: any[];
  onAddDocuments: (files: File[]) => void;
  onRemoveDocument: (id: number) => void;
  onRemoveNewDocument: (index: number) => void;
}

export default function DocumentUpload({ 
  form, 
  existingDocuments = [], 
  onAddDocuments, 
  onRemoveDocument,
  onRemoveNewDocument
}: DocumentUploadProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to a total of 10 documents (existing + new)
      const totalAllowed = 10 - existingDocuments.length;
      const newFiles = files.slice(0, totalAllowed);
      
      if (totalAllowed <= 0) {
        toast.error("Maximum 10 documents allowed");
        return;
      }
      
      if (files.length > totalAllowed) {
        toast.warning(`Only ${totalAllowed} more documents can be added. Maximum limit is 10.`);
      }
      
      // Add the new files to the state
      setSelectedDocuments(prev => [...prev, ...newFiles]);
      
      // Notify parent component
      onAddDocuments(newFiles);
      
      // Create preview URLs if applicable (for PDFs, images, etc.)
      const newPreviewUrls = newFiles.map(file => {
        // For images and PDFs we can create object URLs
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          return URL.createObjectURL(file);
        }
        // For other files, return null
        return null;
      });
      
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Reset the input field to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeNewDocument = (index: number) => {
    // Remove from local state
    setSelectedDocuments(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    // Revoke the object URL if it exists
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Remove from preview URLs
    setPreviewUrls(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    // Notify parent
    onRemoveNewDocument(index);
  };
  
  // Function to get appropriate icon for file type
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <File className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <File className="w-4 h-4 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <File className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Staff Documents</CardTitle>
        <CardDescription>Upload staff documents (PDF, DOC, XLS, Images, etc.)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload documents</span>
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, XLS, Images, etc.</p>
              </div>
              <input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleDocumentChange}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                disabled={existingDocuments.length + selectedDocuments.length >= 10}
              />
            </label>
          </div>

          {/* Display existing documents */}
          {existingDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Existing Documents</h4>
              <div className="grid grid-cols-1 gap-2">
                {existingDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(doc.document_path || doc.name || "")}
                      <a 
                        href={`/api/staff-file/${doc.document_path || doc.name}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate max-w-xs"
                      >
                        {doc.document_path || doc.name || `Document ${doc.id}`}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveDocument(doc.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display newly added documents */}
          {selectedDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">New Documents</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.name)}
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewDocument(index)}
                      className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <span>{existingDocuments.length + selectedDocuments.length} of 10 documents</span>
            {existingDocuments.length + selectedDocuments.length > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Confirm before removing all
                  if (window.confirm("Are you sure you want to remove all documents?")) {
                    // Clear selected documents
                    setSelectedDocuments([]);
                    // Revoke all object URLs
                    previewUrls.forEach(url => {
                      if (url) URL.revokeObjectURL(url);
                    });
                    setPreviewUrls([]);
                    
                    // Notify parent to remove all
                    toast.success("All documents removed. Changes will be saved when you submit the form.");
                  }
                }}
                className="text-xs"
              >
                Remove All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 