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
  trustee_name: z.string().trim().nonempty("Trustee Name is Required"),
  designation: z.string().optional(),
  contact_mobile: z.string().trim().nonempty("Mobile is Required"),
  address: z.string().trim().nonempty("Address is Required"),
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
    const submissionData = {
      ...data,
      name: data.trustee_name,
      userId: User?._id,
    };
    try {
      await axios.post(`/api/trustees`, submissionData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Trustee Master Created Successfully");
      window.history.back();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { errors } = error.response.data; // Extract validation errors

        // Loop through backend errors and set them in the form
        Object.keys(errors).forEach((key) => {
          form.setError(key as keyof ProfileFormValues, {
            type: "server",
            message: errors[key][0], // First error message from array
          });

          // Show each error as a separate toast notification
          toast.error(errors[key][0]);
        });
      } else {
        toast.error("Something went wrong. Please try again.");
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
          {/* Trustee Information */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Trustee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 @[768px]/trusties:grid-cols-2">
                <FormField
                  control={form.control}
                  name="trustee_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Trustee Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Trustee Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Designation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mobile Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Contact"
                          {...field}
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={field.value}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Login Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 @[768px]/trusties:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
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
                      Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex w-full flex-col-reverse gap-3 @[480px]/trusties:flex-row @[480px]/trusties:justify-end">
            <Button onClick={() => window.history.back()} type="button" className="w-full @[480px]/trusties:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full @[480px]/trusties:w-auto">Add Trustee</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  return (
    <div className="@container/trusties min-w-0 w-full px-4 py-4 pb-8">
      <Card className="min-w-0 w-full overflow-hidden bg-light pt-4 shadow-md">
        <Button
          onClick={() => window.history.back()}
          className="mb-4 ml-4 flex gap-2"
        >
          <MoveLeft className="h-5 w-5 text-white" />
          Back
        </Button>

        <CardHeader>
          <CardTitle>Trustees Master</CardTitle>
          <CardDescription>Add Trustees Master</CardDescription>
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
