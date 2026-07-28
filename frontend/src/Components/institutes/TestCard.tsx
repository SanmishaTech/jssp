import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft } from "lucide-react";
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

const profileFormSchema = z.object({
  institute_name: z.string().trim().nonempty("Institute Name is Required"),
  registration_number: z
    .string()
    .trim()
    .nonempty("Registration Number is Required"),
  affiliated_university: z
    .string()
    .trim()
    .nonempty("Affiliated University is Required"),
  name: z.string().optional(),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().trim().nonempty("Password is Required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

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

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    try {
      await axios
        .post(`/api/institutes`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.success("Institute Created Successfully");
          window.history.back();
        });
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
              <CardTitle>Institute Information</CardTitle>
              <CardDescription>
                Provide the details of Institute.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 @[768px]/institutes:grid-cols-2">
                <FormField
                  className="flex-1"
                  control={form.control}
                  name="institute_name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Institute Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Input placeholder="Institute Name..." {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Institute's Registration Number
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Registration Number..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="affiliated_university"
                  render={({ field }) => (
                    <FormItem className="@[768px]/institutes:col-span-2">
                      <FormLabel>
                        Affiliated University
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Affiliated University..."
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

          {/* Profile Information Section */}
          <Card className="max-w-full p-4">
            <CardHeader>
              <CardTitle>Profile/Admin Information</CardTitle>
              <CardDescription>
                Create the Admin/Principal for this Institute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 @[768px]/institutes:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <span className="text-red-500">*</span>
                      </FormLabel>
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
                      <FormLabel>
                        Password
                        <span className="text-red-500">*</span>
                      </FormLabel>
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
        <div className="flex w-full flex-col-reverse gap-3 @[480px]/institutes:flex-row @[480px]/institutes:justify-end">
          <Button
            onClick={() => window.history.back()}
            type="button"
            className="w-full @[480px]/institutes:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full @[480px]/institutes:w-auto">
            Add Institutes
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  return (
    <div className="@container/institutes min-w-0 w-full px-4 py-4 pb-8">
      <Card className="min-w-0 w-full overflow-hidden bg-light pt-4 shadow-md">
        <Button
          onClick={() => window.history.back()}
          className="mb-4 ml-4 flex gap-2"
        >
          <MoveLeft className="h-5 w-5 text-white" />
          Back
        </Button>

        <CardHeader>
          <CardTitle>Institutes Master</CardTitle>
          <CardDescription>Add Institute</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ProfileForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
