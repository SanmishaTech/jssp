import { useState, useEffect } from "react";
// import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  venue: z.string().trim().nonempty("Venue is Required"),
  date: z.string().trim().nonempty("Date is Required"),
  time: z.string().trim().nonempty("Time is Required"),
  synopsis: z.string().trim().nonempty("Synopsis is Required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.

function ProfileForm({ formData }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const { id } = useParams({ from: "/events/edit/$id" });

  const { reset } = form;

  // State for image handling
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Reset form values when formData changes
  useEffect(() => {
    formData.name = formData?.user?.name;
    formData.email = formData?.user?.email;
    reset(formData);

    // Set existing images when formData changes
    if (formData.images && Array.isArray(formData.images)) {
      setExistingImages(formData.images);
    }
  }, [formData, reset]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Check for maximum 10 images
      const totalImages =
        existingImages.length -
        imagesToDelete.length +
        selectedImages.length +
        filesArray.length;
      if (totalImages > 10) {
        toast.error("You can upload a maximum of 10 images");
        return;
      }

      // Create preview URLs for the selected images
      const newPreviewUrls = filesArray.map((file) =>
        URL.createObjectURL(file)
      );

      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    }
  };

  // Remove new image from selection
  const removeNewImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  // Mark existing image for deletion
  const markImageForDeletion = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  // Restore image that was marked for deletion
  const restoreImage = (imageId: number) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add form fields to FormData
      formData.append("venue", data.venue);
      formData.append("date", data.date);
      formData.append("time", data.time);
      formData.append("synopsis", data.synopsis);

      // Add new images to FormData
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Add images to delete
      imagesToDelete.forEach((imageId, index) => {
        formData.append(`delete_images[${index}]`, imageId.toString());
      });

      await axios.post(`/api/events/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Events Master Updated Successfully");
      navigate({ to: "/events" });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          // Handle validation errors
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            // Set form errors
            form.setError(field as keyof ProfileFormValues, {
              message: Array.isArray(messages) ? messages[0] : messages,
            });

            // Show toast for each validation error
            toast.error(Array.isArray(messages) ? messages[0] : messages);
          });
        } else {
          // Handle general error message
          toast.error(errorData.message || "An error occurred");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  const handleViewDocument = (documentName: string) => {
    // URL to your Laravel endpoint to get the document
    const url = `/api/file/${documentName}`;

    // Open the document in a new tab to view it
    window.open(url, '_blank');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        {" "}
        <div className="space-y-6">
          {/* Institute Information Section */}
          <Card className="max-w-full p-4">
            <CardHeader>
              <CardTitle>Events Information</CardTitle>
              <CardDescription>
                Create the Events for this Institute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Venue
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Venue..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" placeholder="Date..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Time
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="Time..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="synopsis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sysnopsis
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Sysnopsis..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Existing Images Section */}
              {existingImages.length > 0 && (
                <div className="mt-6">
                  <FormLabel>Current Event Images</FormLabel>
                  <div className="grid grid-cols-5 gap-4 mt-2">
                    {existingImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={`/api/file/${image.image_path}`}
                          alt={`Event image ${index + 1}`}
                          className={`h-24 w-24 object-cover rounded-md ${
                            imagesToDelete.includes(image.id)
                              ? "opacity-30"
                              : ""
                          }`}
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              image.image_path
                            );
                            e.currentTarget.src = "/placeholder-image.jpg"; // Fallback image
                          }}
                        />
                        <div className="absolute -top-2 -right-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDocument(image.image_path)}
                            className="bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {!imagesToDelete.includes(image.id) ? (
                            <button
                              type="button"
                              onClick={() => markImageForDeletion(image.id)}
                              className="bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => restoreImage(image.id)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white rounded-full p-1 shadow-md"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {imagesToDelete.length > 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      {imagesToDelete.length} image(s) marked for deletion.
                      Changes will be applied after saving.
                    </p>
                  )}
                </div>
              )}

              {/* New Image Upload Section */}
              <div className="mt-6">
                <FormLabel>
                  Add New Images{" "}
                  <span className="text-xs text-gray-500">
                    (Max 10 images total)
                  </span>
                </FormLabel>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="imageUpload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                      <Input
                        id="imageUpload"
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/jpg, image/gif"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                {/* New Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      New Images to Upload
                    </h4>
                    <div className="grid grid-cols-5 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="h-24 w-24 object-cover rounded-md cursor-pointer"
                            onClick={() => window.open(url, "_blank")}
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Count Information */}
                <p className="text-xs text-gray-500 mt-2">
                  Total images after changes:{" "}
                  {existingImages.length -
                    imagesToDelete.length +
                    selectedImages.length}
                  /10
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/events" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Events
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/events/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/events/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data.Event);
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
        <CardTitle>Events Master</CardTitle>
        <CardDescription>Edit/Update the Event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
    </Card>
  );
}
