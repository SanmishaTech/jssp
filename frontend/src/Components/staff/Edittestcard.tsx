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
import { useParams } from "@tanstack/react-router";

const profileFormSchema = z.object({
  staff_name: z.string().nonempty("Staff Name Required"),
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
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  name?: string;
};

// This can come from your database or API.

function ProfileForm({ formData }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const { id } = useParams({ from: "/staff/edit/$id" });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deleteExisting, setDeleteExisting] = useState(false);

  const { reset } = form;

  // Reset form values when formData changes
  useEffect(() => {
    reset(formData);
    if (formData?.images) {
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
  }, [formData, reset]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  async function onSubmit(data: ProfileFormValues) {
    data.name = data.staff_name;
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'images') {
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

      await axios.post(`/api/staff/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff Updated Successfully");
      navigate({ to: "/staff" });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const { errors, message } = error.response.data; // Extract validation errors

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
          toast.error(message || "Something went wrong, please try again.");
        }
      } else {
        toast.error("Something went wrong, please try again.");
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        {" "}
        <div className="max-w-full p-4 space-y-6">
          {/* Staff Information Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Information</CardTitle>
                </div>
                <div className="flex space-x-4 flex-row-reverse">
                  <FormField
                    control={form.control}
                    name="is_teaching"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        {/* <FormLabel>Staff Type</FormLabel> */}
                        <FormControl>
                          <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="teaching"
                                {...field}
                                value={0}
                                checked={Number(field.value) === 0}
                                // value={0}
                                // checked={field.value === 0}
                                className="h-4 w-4"
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
                                // value="1"
                                // checked={field.value === "1"}
                                className="h-4 w-4"
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3 space-y-3">
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

          {/* Add this before the Profile Information Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Staff Documents Images</CardTitle>
              <CardDescription>Upload up to 5 images (JPEG, PNG, JPG - Max 2MB each)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleImageChange}
                  disabled={existingImages.length + selectedImages.length >= 5}
                />

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
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
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

          {/* Profile Information Card */}
          <Card className="w-full ">
            <CardHeader>
              <CardTitle>Staff Login Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password..."
                          type="password"
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
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/staff" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Staff
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/staff/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/staff/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data.Staff);
    };
    if (id) {
      fetchData();
    }
    return () => {
      setFormData({});
    };
  }, [id]);
  return (
    <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4 ">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5 text-white" />
        Back
      </Button>

      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Staff Master</CardTitle>
          {formData?.institute_name && (
            <span className="text-muted-foreground">
              {formData.institute_name}
            </span>
          )}
        </div>
        <CardDescription>Edit/Update the Staff</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
    </Card>
  );
}
