import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import EducationQualifications from "./EducationQualifications";
import PaperUpload from "./PaperUpload";
import MedicalImageUpload from "./MedicalImageUpload";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const profileFormSchema = z.object({
  staff_name: z.string().nonempty("Staff Name Required"),
  employee_code: z.string().nonempty("Employee Code Required"),
  is_teaching: z.any().optional(),
  date_of_birth: z.any().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.any().optional(),
  images: z.any().optional(),
  delete_existing_images: z.boolean().optional(),
  delete_existing_education: z.boolean().optional(),
  deleted_education_ids: z.array(z.number()).optional(),
  education: z.array(
    z.object({
      id: z.number().optional(),
      qualification: z.any().optional(),
      college_name: z.any().optional(),
      board_university: z.any().optional(),
      passing_year: z.any().optional(),
      percentage: z.any().optional().refine(
        (val) => {
          if (!val) return true; // Allow empty values
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "Percentage must be between 0 and 100" }
      ),
    })
  ).optional(),

  gender: z.any().optional(),
  experience: z.any().optional(),
  highest_qualification: z.any().optional(),
  medical_history: z.any().optional(),
  medical_image: z.any().optional(),
  delete_medical_image: z.boolean().optional(),
 pan_number: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must be in format: AAAPA1234A"),
  aadhaar_number: z.any().optional(),
  appointment_date: z.any().optional(),
  nature_of_appointment: z.any().optional(),
  subject_type: z.any().optional(),
  mode_of_payment: z.any().optional(),
  bank_name: z.any().optional(),
  account_number: z.any().optional(),
  ifsc_code: z.any().optional(),
  salary: z.any().optional(),
  documents: z.any().optional(),
  delete_existing_documents: z.boolean().optional(),
  deleted_document_ids: z.array(z.number()).optional(),
  papers: z.any().optional(),
  delete_existing_papers: z.boolean().optional(),
  deleted_paper_ids: z.array(z.number()).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  name?: string;
};

// Define field props type for form fields
type FieldProps = {
  field: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    name: string;
    ref: React.RefObject<any>;
  };
  fieldState: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: {
      type: string;
      message?: string;
    };
  };
  formState: any;
};

function ProfileForm({ formData }) {
  const defaultValues: Partial<ProfileFormValues> = {
    staff_name: '',
    employee_code: '',
    is_teaching: '0',
    date_of_birth: '',
    address: '',
    mobile: '',
    email: '',
    gender: '',
    experience: '',
    highest_qualification: '',
    pan_number: '',
    aadhaar_number: '',
    appointment_date: '',
    nature_of_appointment: '',
    subject_type: '',
    mode_of_payment: 'Online',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    salary: '',
    medical_history: '',
    education: [
      {
        qualification: '',
        college_name: '',
        board_university: '',
        passing_year: '',
        percentage: '',
      }
    ],
    ...formData
  };
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deleteExisting, setDeleteExisting] = useState(false);
  
  // Document state
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [deletedDocumentIds, setDeletedDocumentIds] = useState<number[]>([]);
  
  // Papers state (for PDFs only)
  const [selectedPapers, setSelectedPapers] = useState<File[]>([]);
  const [existingPapers, setExistingPapers] = useState<any[]>([]);
  const [deletedPaperIds, setDeletedPaperIds] = useState<number[]>([]);

  // Medical image state
  const [selectedMedicalImage, setSelectedMedicalImage] = useState<File | null>(null);
  const [existingMedicalImage, setExistingMedicalImage] = useState<any>(null);
  const [deleteMedicalImage, setDeleteMedicalImage] = useState(false);

  const { reset, control } = form;
  
  // Reset form values when formData changes
  useEffect(() => {
    if (formData) {
      // Prepare the formData with proper education structure for reset
      const formDataWithEducation = {
        ...formData,
        education: formData.education && formData.education.length > 0 
          ? formData.education.map(edu => ({
              id: edu.id,
              qualification: edu.qualification || '',
              college_name: edu.college_name || '',
              board_university: edu.board_university || '',
              passing_year: edu.passing_year ? edu.passing_year.toString() : '',
              percentage: edu.percentage ? edu.percentage.toString() : '',
            }))
          : [{
              qualification: '',
              college_name: '',
              board_university: '',
              passing_year: '',
              percentage: '',
            }]
      };
      
      // Reset the form with the prepared data
      reset(formDataWithEducation);
      
      if (formData.images) {
        console.log('Image data received:', formData.images);
        
        // Map the images to ensure they have the right structure
        const processedImages = formData.images.map(img => ({
          ...img,
          // If the image_path is already correct, use it, otherwise ensure it's properly formatted
          image_path: img.image_path || (typeof img.url === 'string' ? img.url.split('/').pop() : `Image ${img.id}`)
        }));
        
        setExistingImages(processedImages);
        setDeletedImageIds([]);
      }
      
      // Handle documents data if available
      if (formData.documents) {
        console.log('Documents data received:', formData.documents);
        
        // Map the documents to ensure they have the right structure
        const processedDocuments = formData.documents.map(doc => ({
          ...doc,
          // If the document_path is already correct, use it, otherwise ensure it's properly formatted
          document_path: doc.document_path || (typeof doc.url === 'string' ? doc.url.split('/').pop() : `Document ${doc.id}`)
        }));
        
        setExistingDocuments(processedDocuments);
        setDeletedDocumentIds([]);
      }
      
      // Handle papers data if available
      if (formData.papers) {
        console.log('Papers data received:', formData.papers);
        
        // Map the papers to ensure they have the right structure
        const processedPapers = formData.papers.map(paper => ({
          ...paper,
          // If the paper_path is already correct, use it, otherwise ensure it's properly formatted
          paper_path: paper.paper_path || (typeof paper.url === 'string' ? paper.url.split('/').pop() : `Paper ${paper.id}`)
        }));
        
        setExistingPapers(processedPapers);
        setDeletedPaperIds([]);
      }
      
      // Handle medical image if available
      if (formData.medical_image_path) {
        console.log('Medical image data received:', formData.medical_image_path);
        setExistingMedicalImage({
          id: 'medical_image',
          image_path: formData.medical_image_path
        });
      } else {
        setExistingMedicalImage(null);
      }
    }
  }, [formData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 5 images total (existing + new)
      const totalAllowed = 5 - existingImages.length;
      const newFiles = files.slice(0, totalAllowed);
      setSelectedImages([...selectedImages, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewUrls(prevUrls => {
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId));
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Document handlers
  const handleAddDocuments = (files: File[]) => {
    setSelectedDocuments(prev => [...prev, ...files]);
  };
  
  const handleRemoveDocument = (id: number) => {
    setExistingDocuments(existingDocuments.filter(doc => doc.id !== id));
    setDeletedDocumentIds([...deletedDocumentIds, id]);
  };
  
  const handleRemoveNewDocument = (index: number) => {
    setSelectedDocuments(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Paper handlers
  const handleAddPapers = (files: File[]) => {
    console.log('Adding papers to state:', files.map(f => f.name));
    setSelectedPapers(prev => [...prev, ...files]);
  };
  
  const handleRemovePaper = (id: number) => {
    console.log('Removing existing paper with ID:', id);
    setExistingPapers(existingPapers.filter(paper => paper.id !== id));
    setDeletedPaperIds([...deletedPaperIds, id]);
  };
  
  const handleRemoveNewPaper = (index: number) => {
    console.log('Removing new paper at index:', index);
    setSelectedPapers(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Medical image handlers
  const handleAddMedicalImage = (file: File) => {
    console.log('Adding medical image to state:', file.name);
    setSelectedMedicalImage(file);
  };
  
  const handleRemoveMedicalImage = () => {
    console.log('Removing medical image');
    if (existingMedicalImage) {
      // If there's an existing image, mark it for deletion
      setDeleteMedicalImage(true);
      setExistingMedicalImage(null);
    } else {
      // If it's a newly added image, just clear it
      setSelectedMedicalImage(null);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    data.name = data.staff_name;
    try {
      const formData = new FormData();
      
      // Log the data being submitted
      console.log('Full data to submit:', data);
      
      // Add all form fields except for files and arrays that need special handling
      Object.keys(data).forEach(key => {
        if (key !== 'images' && key !== 'education' && key !== 'documents' && key !== 'papers' && key !== 'medical_image') {
          formData.append(key, data[key]);
        }
      });

      // Append each selected image to the FormData
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Add flag to delete existing images if requested
      formData.append('delete_existing_images', deleteExisting.toString());
      
      // Send the list of image IDs to delete
      if (deletedImageIds.length > 0 && !deleteExisting) {
        formData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      }
      
      // Handle medical image upload
      if (selectedMedicalImage) {
        console.log('Adding medical image to form:', selectedMedicalImage.name);
        formData.append('medical_image', selectedMedicalImage);
      }
      
      // Handle deleting medical image if requested
      formData.append('delete_medical_image', deleteMedicalImage.toString());
      
      // Append each selected paper to the FormData
      console.log('Selected papers to upload:', selectedPapers);
      if (selectedPapers.length > 0) {
        selectedPapers.forEach((paper, index) => {
          console.log(`Adding paper ${index}:`, paper.name, paper.type, paper.size);
          formData.append(`papers[${index}]`, paper);
        });
      } else {
        console.log('No papers to upload');
      }
      
      // Send the list of paper IDs to delete
      if (deletedPaperIds.length > 0) {
        console.log('Deleted paper IDs:', deletedPaperIds);
        formData.append('deleted_paper_ids', JSON.stringify(deletedPaperIds));
      }
      
      // Append each selected document to the FormData if DocumentUpload is being used
      if (selectedDocuments && selectedDocuments.length > 0) {
        selectedDocuments.forEach((document, index) => {
          formData.append(`documents[${index}]`, document);
        });
        
        // Send the list of document IDs to delete
        if (deletedDocumentIds.length > 0) {
          formData.append('deleted_document_ids', JSON.stringify(deletedDocumentIds));
        }
      }

      // Append education data as JSON
      if (data.education && data.education.length > 0) {
        // First clean up any empty fields in the education data
        const cleanEducation = data.education
          .map(edu => ({
            ...edu,
            // Ensure all values are properly formatted for the backend
            passing_year: edu.passing_year ? edu.passing_year.toString() : '',
            percentage: edu.percentage ? edu.percentage.toString() : '',
          }))
          .filter(edu => 
            edu.qualification || 
            edu.college_name || 
            edu.board_university || 
            edu.passing_year || 
            edu.percentage
          );
        
        console.log('Submitting education data:', cleanEducation);
        
        // Make sure to stringify the entire array, not each individual item
        formData.append('education', JSON.stringify(cleanEducation));
        
        // Log the FormData to make sure it's correct (this will show [object Object] but it confirms the entry exists)
        console.log('FormData education entry exists:', formData.has('education'));
      } else {
        console.log('No education data to submit');
      }

      // Log the FormData entries for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], 'File:', pair[1].name, pair[1].type, pair[1].size + ' bytes');
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      const staff_id = localStorage.getItem("staff_id");
      console.log('Sending data to API endpoint:', `/api/staff/${staff_id}?_method=PUT`);
      const response = await axios.post(`/api/staff/${staff_id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Server response:', response.data);
      toast.success("Profile Updated Successfully");
      // Navigate to memberdashboard after successful update
      navigate({ to: "/memberdashboard" });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      if (axios.isAxiosError(error) && error.response) {
        const { errors, message } = error.response.data; // Extract validation errors
        console.error('Server error response:', error.response.data);

        if (errors) {
          // Loop through backend validation errors and set them in the form
          Object.keys(errors).forEach((key) => {
            form.setError(key as keyof ProfileFormValues, {
              type: "server",
              message: errors[key][0], // First error message from array
            });

            // Show each validation error as a separate toast notification
            toast.error(errors[key][0]);
          });
        } else {
          // If no specific validation errors, show a generic message
          toast.error(message || "Failed to update profile. Please try again.");
        }
      } else {
        toast.error("Failed to update profile. Please check your connection and try again.");
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Profile Information</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Educational Qualifications</TabsTrigger>
            <TabsTrigger value="papers" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Papers</TabsTrigger>
            <TabsTrigger value="medical" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Medical History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-4">
            <div className="max-w-full p-4 space-y-6">
              {/* Personal Information Card */}
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Employee Code:</label>
                          <span className="text-muted-foreground">{form.getValues("employee_code") || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex space-x-4 flex-row-reverse">
                      <FormField
                        control={form.control}
                        name="is_teaching"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="teaching"
                                    {...field}
                                    value={0}
                                    checked={Number(field.value) === 0}
                                    className="h-4 w-4"
                                    disabled
                                  />
                                  <label htmlFor="teaching">Teaching</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="non_teaching"
                                    {...field}
                                    value={1}
                                    checked={Number(field.value) === 1}
                                    className="h-4 w-4"
                                    disabled
                                  />
                                  <label htmlFor="non_teaching">Non-Teaching</label>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-4 space-y-3">
                    {/* Form fields for personal information */}
                    <FormField
                      control={form.control}
                      name="staff_name"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-center min-h-[100px]">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Add remaining personal profile fields here */}
                    <FormField
                      control={form.control}
                      name="mobile"
                      rules={{
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]{10}$/, // Ensures exactly 10 numeric digits
                          message:
                            "Mobile number must be exactly 10 digits and contain only numbers",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter 10-digit mobile number"
                              maxLength={10} // Prevents input beyond 10 characters
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(/\D/g, ""); // Removes non-numeric characters
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              max={
                                new Date(
                                  new Date().setFullYear(
                                    new Date().getFullYear() - 18
                                  )
                                )
                                  .toISOString()
                                  .split("T")[0]
                              } // Users must be 18 or older
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Continue with other personal info fields */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem >
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     {/* ... rest of the profile fields ... */}
                     <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-center min-h-[100px]">
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Experience..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="highest_qualification"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-center min-h-[100px]">
                          <FormLabel>Highest Qualification</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Highest Qualification..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <FormField
  control={form.control}
  name="pan_number"
  render={({ field }) => (
    <FormItem className="flex flex-col justify-center min-h-[100px]">
      <FormLabel>PAN Number</FormLabel>
      <FormControl>
        <Input
          placeholder="Enter PAN Number..."
          {...field}
          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
          maxLength={10}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="aadhaar_number"
  render={({ field }: Pick<FieldProps, 'field'>) => (
    <FormItem className="flex flex-col justify-center min-h-[100px]">
      <FormLabel>Aadhaar Number</FormLabel>
      <FormControl>
        <Input
          placeholder="Enter Aadhaar Number..."
          {...field}
          maxLength={12}
          inputMode="numeric"
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "");
            field.onChange(onlyDigits);
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="appointment_date"
  render={({ field }: Pick<FieldProps, 'field'>) => (
    <FormItem>
      <FormLabel>Appointment Date</FormLabel>
      <FormControl>
        <Input
          type="date"
          min={new Date().toISOString().split("T")[0]} // today
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

                     <FormField
                      control={form.control}
                      name="nature_of_appointment"
                      render={({ field }) => (
                        <FormItem >
                          <FormLabel>Nature of Appointment</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Nature of Appointment..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="subject_type"
                      render={({ field }) => (
                        <FormItem >
                          <FormLabel>Subject Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Subject Type..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem >
                          <FormLabel>Salary</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Salary..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem >
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Email..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                   </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Address..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            
              {/* Payment Information Card */}
              <Card className="w-full ">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bank Information</CardTitle>
                    <FormField
                      control={form.control}
                      name="mode_of_payment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormLabel className="font-medium">Mode of Payment:</FormLabel>
                          <FormControl>
                            <div className="flex space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="online"
                                  {...field}
                                  value="Online"
                                  checked={field.value === "Online"}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="online">Online</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="offline"
                                  {...field}
                                  value="Offline"
                                  checked={field.value === "Offline"}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="offline">Offline</label>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Bank Name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account_holder_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Account Holder Name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Account Number..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ifsc_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter IFSC Code..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            
              {/* Staff Document Images Card */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Staff Documents Images</CardTitle>
                  <CardDescription>Upload up to 5 images (JPEG, PNG, JPG - Max 2MB each)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Existing Images</h4>
                        {existingImages.map((img) => {
                          console.log('Image object:', img);
                          return (
                          <div key={img.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <a 
                              href={`/api/staff-file/${img.image_path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {img.image_path || `Image ${img.id}`}
                            </a>
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* New Images */}
                    {selectedImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">New Images</h4>
                        {selectedImages.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <a 
                              href={previewUrls[index]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="mt-4">
            <div className="max-w-full p-4 space-y-6">
              {/* Education Qualifications Component */}
              <EducationQualifications form={form} />
            </div>
          </TabsContent>
          
          <TabsContent value="papers" className="mt-4">
            <div className="max-w-full p-4 space-y-6">
              {/* Paper Upload Component (PDF Only) */}
              <PaperUpload 
                form={form}
                existingPapers={existingPapers}
                onAddPapers={handleAddPapers}
                onRemovePaper={handleRemovePaper}
                onRemoveNewPaper={handleRemoveNewPaper}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="medical" className="mt-4">
            <div className="max-w-full p-4 space-y-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                  <CardDescription>Enter staff medical history and health information</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="medical_history"
                    render={({ field }: Pick<FieldProps, 'field'>) => (
                      <FormItem>
                        <FormLabel>Medical History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter medical history, conditions, or important health information..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include relevant medical conditions, allergies, or health information that may be important.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Medical Image Upload Component */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Medical Image</h3>
                    <p className="text-sm text-gray-500 mb-4">Upload a medical image related to the staff's medical history</p>
                    <MedicalImageUpload 
                      existingMedicalImage={existingMedicalImage}
                      onAddMedicalImage={handleAddMedicalImage}
                      onRemoveMedicalImage={handleRemoveMedicalImage}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end w-full gap-3">
          <Button
            onClick={() => navigate({ to: "/staffdashboard" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button 
            className="self-center mr-8" 
            type="button"
            onClick={() => {
              // Get current form values
              const values = form.getValues();
              console.log('Current form values:', values);
              console.log('Selected papers before submission:', selectedPapers);
              
              // Trigger validation
              form.trigger().then(isValid => {
                if (isValid) {
                  onSubmit(values);
                } else {
                  console.log('Form validation errors:', form.formState.errors);
                  toast.error("Please fix the form errors before submitting");
                }
              });
            }}
          >
            Update Staff
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  // Get staff_id from localStorage instead of URL params
  const staff_id = localStorage.getItem("staff_id");
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/staff/${staff_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.data.Staff);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        toast.error("Failed to load staff data");
      }
    };
    
    if (staff_id) {
      fetchData();
    } else {
      toast.error("Staff ID not found");
      navigate({ to: "/staff" });
    }
    
    return () => {
      setFormData({});
    };
  }, [staff_id, token]);

  return (
    <div className="min-w-[350px] overflow-auto bg-light shadow-md pt-4 p-4">
      <Button
        onClick={() => window.history.back()}
        className="flex gap-2 mb-6"
      >
        <MoveLeft className="w-5 text-white" />
        Back
      </Button>
      
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">Edit/Update the Profile</p>
        </div>
        {formData?.institute_name && (
          <span className="text-muted-foreground">
            {formData.institute_name}
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        <ProfileForm formData={formData} />
      </div>
    </div>
  );
}
