import { useState, useEffect } from "react";
// import { Link, Navigate } from "react-router-dom";
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
import { useParams } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  name: z.string().optional(),
  is_teaching: z.string().optional(),
  date_of_birth: z.any().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
  alternate_mobile: z.string().optional(),
  profile_name: z.string().optional(),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().optional(),
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
  const { id } = useParams({ from: "/members/edit/$id" });

  const { reset } = form;

  // Reset form values when formData changes
  useEffect(() => {
    formData.profile_name = formData?.user?.name;
    formData.email = formData?.user?.email;
    reset(formData);
  }, [formData, reset]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function onSubmit(data: ProfileFormValues) {
    await axios
      .put(`/api/members/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Mamber Master Updated Successfully");
        navigate({ to: "/members" });
      });
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input placeholder="Mobile..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternate_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Mobile</FormLabel>
                      <FormControl>
                        <Input placeholder="Alternate Mobile..." {...field} />
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
                        <Input type="date" {...field} />
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

          {/* Profile Information Card */}
          <Card className="w-full ">
            <CardHeader>
              <CardTitle>Staff Login Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField
                  className="flex-1"
                  control={form.control}
                  name="profile_name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Profile Name</FormLabel>
                      <Input placeholder="Profile Name..." {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
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
            onClick={() => navigate({ to: "/members" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Member
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/members/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/members/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data.Profile);
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
        <CardTitle>Staff Master</CardTitle>
        <CardDescription>Edit/Update the Staff</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  );
}
