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
  subject_name: z.string().trim().nonempty("Subject Name is Required"),
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
  const { id } = useParams({ from: "/subjects/edit/$id" });

  const { reset } = form;

  // Reset form values when formData changes
  useEffect(() => {
    formData.name = formData?.user?.name;
    formData.email = formData?.user?.email;
    reset(formData);
  }, [formData, reset]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axios.put(`/api/subjects/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Subject Master Updated Successfully");
      navigate({ to: "/subjects" });
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

          <div className="grid grid-cols-1 gap-3">
            <FormField
              control={form.control}
              name="subject_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject Name
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Subject Name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/subjects" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Subjects
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/subjects/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/subjects/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data.Subject);
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
        <CardTitle>Subject Master</CardTitle>
        <CardDescription>Edit/Update the Subject</CardDescription>
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
