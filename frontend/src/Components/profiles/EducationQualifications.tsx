import { X, Upload, File } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

interface EducationQualificationsProps {
  form: UseFormReturn<any>;
  existingDocuments?: any[];
  onAddDocuments?: (files: File[]) => void;
  onRemoveDocument?: (id: number) => void;
  onRemoveNewDocument?: (index: number) => void;
}

export default function EducationQualifications({ 
  form, 
  existingDocuments = [], 
  onAddDocuments, 
  onRemoveDocument,
  onRemoveNewDocument 
}: EducationQualificationsProps) {
  const { control } = form;
  
  // UseFieldArray hook for managing dynamic education fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // State for certificate upload functionality
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);

  // Function to add a new education field
  const addEducationField = () => {
    append({
      qualification: '',
      college_name: '',
      board_university: '',
      passing_year: '',
      percentage: '',
    });
  };

  // Function to handle removal of an education field
  const removeEducationField = (index: number) => {
    remove(index);
  };
  
  // Certificate handling functions
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onAddDocuments) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to a total of 10 certificates (existing + new)
      const totalAllowed = 10 - existingDocuments.length;
      const newFiles = files.slice(0, totalAllowed);
      
      if (totalAllowed <= 0) {
        toast.error("Maximum 10 certificates allowed");
        return;
      }
      
      if (files.length > totalAllowed) {
        toast.warning(`Only ${totalAllowed} more certificates can be added. Maximum limit is 10.`);
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
    if (!onRemoveNewDocument) return;
    
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
        <div className="flex items-center justify-between">
          <CardTitle>Educational Qualifications</CardTitle>
        </div>
        <CardDescription>Add your educational qualifications and details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Qualification</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Institute Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Board/University</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Passing Year</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.qualification`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="Degree/Diploma" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.college_name`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="College/Institution" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.board_university`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="Board/University" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.passing_year`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="YYYY" 
                              {...field} 
                              className="w-full"
                              maxLength={4}
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/\D/g, "").substring(0, 4);
                              }}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.percentage`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="0-100" 
                              {...field} 
                              className="w-full"
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9.]/g, "");
                                if (target.value !== '' && parseFloat(target.value) > 100) {
                                  target.value = '100';
                                }
                              }}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button
                        type="button"
                        onClick={() => removeEducationField(index)}
                        className="bg-blue-300 hover:bg-blue-600 text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            onClick={addEducationField}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add Education
          </Button>
        </div>
        
        {/* Certificate Upload Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Education Certificates</h3>
          <p className="text-sm text-gray-500">Upload education certificates (PDF, DOC, XLS, Images, etc.)</p>
          
          <div className="flex items-center justify-center w-full">
            <label htmlFor="certificate-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload certificates</span>
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, XLS, Images, etc.</p>
              </div>
              <input
                id="certificate-upload"
                type="file"
                className="hidden"
                onChange={handleDocumentChange}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                disabled={existingDocuments.length + selectedDocuments.length >= 10}
              />
            </label>
          </div>

          {/* Display existing certificates */}
          {existingDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Existing Certificates</h4>
              <div className="grid grid-cols-1 gap-2">
                {existingDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(doc.certificate_path || doc.document_path || doc.name || "")}
                      <a 
                        href={`/api/staff-file/${doc.certificate_path || doc.document_path || doc.name}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate max-w-xs"
                      >
                        {doc.certificate_path || doc.document_path || doc.name || `Certificate ${doc.id}`}
                      </a>
                    </div>
                    {onRemoveDocument && (
                      <button
                        type="button"
                        onClick={() => onRemoveDocument(doc.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display newly added certificates */}
          {selectedDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">New Certificates</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.name)}
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    {onRemoveNewDocument && (
                      <button
                        type="button"
                        onClick={() => removeNewDocument(index)}
                        className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}