import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, X } from "lucide-react";
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

import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

const profileFormSchema = z.object({
  staff_name: z.string().nonempty("Name is Required"),
  employee_code: z.string().nonempty("Employee Code is Required"),
  is_teaching: z.string().optional(),
  date_of_birth: z.any().optional(),
  address: z.string().nonempty("Address is Required"),
  mobile: z.string().optional(),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
  images: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  userId?: string;
  name?: string;
};

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {};

function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");
  //   const { fields, append } = useFieldArray({
  //     name: "urls",
  //     control: form.control,
  //   });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 5 images
      const newFiles = files.slice(0, 5 - selectedImages.length);
      setSelectedImages([...selectedImages, ...newFiles]);

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    data.name = data.staff_name;

    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key !== "images") {
          formData.append(key, data[key]);
        }
      });

      // Append each selected image to the FormData
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      await axios.post(`/api/staff`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff Master Created Successfully");
      window.history.back();
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
                        <FormControl>
                          <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="is_teaching"
                                {...field}
                                value="0"
                                checked={field.value === "0"}
                                className="h-4 w-4"
                              />
                              <label htmlFor="teaching">Teaching</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="is_teaching"
                                {...field}
                                value="1"
                                checked={field.value === "1"}
                                className="h-4 w-4"
                              />
                              <label htmlFor="1">Non-Teaching</label>
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
                <FormField
                  control={form.control}
                  name="staff_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center min-h-[100px]">
                      <FormLabel className="">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee_code"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel >Employee Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Employee Code..." {...field} />
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

          {/* Staff Images Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Staff Documents Images</CardTitle>
              <CardDescription>
                Upload up to 5 images (JPEG, PNG, JPG - Max 2MB each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleImageChange}
                  disabled={selectedImages.length >= 5}
                />

                <div className="space-y-2 mt-4">
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
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="w-full ">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 ">
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
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Staff
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
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
        <CardTitle>Staff Master</CardTitle>
        <CardDescription>Add Staff Master</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 ">
          <ProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
