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

interface PaperUploadProps {
  form: UseFormReturn<any>;
  existingPapers: any[];
  onAddPapers: (files: File[]) => void;
  onRemovePaper: (id: number) => void;
  onRemoveNewPaper: (index: number) => void;
}

export default function PaperUpload({ 
  form, 
  existingPapers = [], 
  onAddPapers, 
  onRemovePaper,
  onRemoveNewPaper
}: PaperUploadProps) {
  const [selectedPapers, setSelectedPapers] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handlePaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      console.log("Files selected:", files.map(f => `${f.name} (${f.type}, ${f.size} bytes)`));
      
      // Validate file types - only accept PDFs
      const validFiles = files.filter(file => file.type === 'application/pdf');
      
      if (validFiles.length < files.length) {
        toast.error("Only PDF files are allowed");
      }
      
      if (validFiles.length === 0) return;
      
      // Limit to a total of 10 papers (existing + new)
      const totalAllowed = 10 - (existingPapers.length + selectedPapers.length);
      const newFiles = validFiles.slice(0, totalAllowed);
      
      if (totalAllowed <= 0) {
        toast.error("Maximum 10 papers allowed");
        return;
      }
      
      if (validFiles.length > totalAllowed) {
        toast.warning(`Only ${totalAllowed} more papers can be added. Maximum limit is 10.`);
      }
      
      // Add the new files to the state
      setSelectedPapers(prev => [...prev, ...newFiles]);
      
      // Create preview URLs - we know these will be strings since we're only accepting PDFs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Notify parent component with the new files
      console.log("Notifying parent component with files:", newFiles.map(f => f.name));
      onAddPapers(newFiles);
      
      // Reset the input field to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeNewPaper = (index: number) => {
    console.log(`Removing paper at index ${index}`);
    
    // Get the paper to be removed
    const paperToRemove = selectedPapers[index];
    
    // Remove from local state
    setSelectedPapers(prev => {
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
    console.log(`Notifying parent to remove paper: ${paperToRemove?.name || 'unknown'}`);
    onRemoveNewPaper(index);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Papers</CardTitle>
        <CardDescription>Upload papers (PDF format only)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="paper-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload papers</span>
                </p>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
              <input
                id="paper-upload"
                type="file"
                className="hidden"
                onChange={handlePaperChange}
                multiple
                accept=".pdf,application/pdf"
                disabled={existingPapers.length + selectedPapers.length >= 10}
              />
            </label>
          </div>

          {/* Display existing papers */}
          {existingPapers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Existing Papers</h4>
              <div className="grid grid-cols-1 gap-2">
                {existingPapers.map((paper) => (
                  <div key={paper.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-red-500" />
                      <a 
                        href={`/api/staff-file/${paper.paper_path || paper.name}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate max-w-xs"
                      >
                        {paper.paper_path || paper.name || `Paper ${paper.id}`}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemovePaper(paper.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display newly added papers */}
          {selectedPapers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">New Papers</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedPapers.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewPaper(index)}
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
            <span>{existingPapers.length + selectedPapers.length} of 10 papers</span>
            {existingPapers.length + selectedPapers.length > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Confirm before removing all
                  if (window.confirm("Are you sure you want to remove all papers?")) {
                    // Clear selected papers
                    setSelectedPapers([]);
                    // Revoke all object URLs
                    previewUrls.forEach(url => {
                      URL.revokeObjectURL(url);
                    });
                    setPreviewUrls([]);
                    
                    // Notify parent to remove all
                    console.log("Removing all papers");
                    toast.success("All papers removed. Changes will be saved when you submit the form.");
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