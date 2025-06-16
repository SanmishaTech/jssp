import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Editor } from "primereact/editor";

import axios from "axios";
import { toast } from "sonner";




const profileFormSchema = z.object({
  venue: z.string().trim().nonempty("Venue is Required"),
  date: z.string().trim().nonempty("Date is Required"),
  time: z.string().trim().nonempty("Time is Required"),
  synopsis: z.any().optional(),
  staff_ids: z.array(z.string()).min(1, "Select at least one staff"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = { staff_ids: [] };

function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const token = localStorage.getItem("token");
    const [staffOptions, setStaffOptions] = React.useState<{ label: string; value: string }[]>([]);
  React.useEffect(() => {
    axios.get('/api/staff').then(res => {
      const opts = (res.data?.data?.Staff || []).map((s: any) => {
        const name = s.staff_name || s.name;
        let role: string | undefined = s.role || s.role_name;
        if (role) {
          const lower = role.toLowerCase().replace(/\s+/g, "");
          if (lower === "nonteachingstaff" || lower === "non-teachingstaff" || lower === "nonteaching staff") {
            role = "Non-Teaching Staff";
          } else if (lower === "teachingstaff" || lower === "teaching staff") {
            role = "Teaching Staff";
          } else if (lower === "viceprincipal" || lower === "vice principal") {
            role = "Vice Principal";
          } else if (lower === "officesuperintendent" || lower === "office superintendent") {
            role = "Office Superintendent";
          } else {
            role = role
              .replace(/[-_]/g, " ")
              .split(" ")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
          }
        }
        return {
          label: role ? `${name} (${role})` : name,
          value: String(s.id),
        };
      });
      setStaffOptions(opts);
    });
  }, []);

//   const { fields, append } = useFieldArray({
  //     name: "urls",
  //     control: form.control,
  //   });

  async function onSubmit(data: ProfileFormValues) {
    // convert staff_ids to numbers
    const payload = { ...data, staff_ids: data.staff_ids.map((id)=>Number(id)) };
    
    try {
      await axios
        .post(`/api/meetings`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          toast.success("Meeting Created Successfully");
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
          {/* Room Information Section */}
          <Card className="max-w-full p-4">
            <CardHeader></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="staff_ids"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Staff Members <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={staffOptions}
                          defaultValue={field.value}
                          onValueChange={(val)=> field.onChange(val)}
                          placeholder="Select staff members"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                     </FormLabel>
                    <FormControl>
                    <Editor
                        className="w-full"
                        value={field.value}
                        onTextChange={(e) => field.onChange(e.htmlValue)}
                        style={{ minHeight: "200px", maxHeight: "345px", width: "100%", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word", overflowY: "auto" }}
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
            Add Meeting
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
        <CardTitle>Meeting Master</CardTitle>
        <CardDescription>Add Meeting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
