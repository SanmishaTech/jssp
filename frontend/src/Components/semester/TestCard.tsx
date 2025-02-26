import React from "react";
import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, ChevronsUpDown, Check } from "lucide-react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../components/ui/command";

const profileFormSchema = z.object({
  course_id: z.string().trim().nonempty("Course Title is Required"),
  standard: z.string().trim().nonempty("Standard is Required"),
  semester: z.string().trim().nonempty("Semester is Required"),
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

  // Fetch courses from /allcourses
  const [courses, setCourses] = React.useState<
    Array<{ _id: string; title: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    axios
      .get("/api/all_courses", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Update this line to extract courses from the API response.
        const coursesData = response.data.data.Course || [];
        setCourses(coursesData);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(data: ProfileFormValues) {
    // Add the user ID before submitting
    data.userId = User?._id;
    try {
      await axios
        .post(`/api/semesters`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.success("Semester Created Successfully");
          window.history.back();
        });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          // Handle validation errors
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            form.setError(field as keyof ProfileFormValues, {
              message: Array.isArray(messages) ? messages[0] : messages,
            });
            toast.error(Array.isArray(messages) ? messages[0] : messages);
          });
        } else {
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
        <div className="space-y-6">
          {/* Semester Information Section */}
          <Card className="max-w-full p-4">
            <CardHeader>
              <CardTitle>Semester Information</CardTitle>
              <CardDescription>
                Create the Semester for this Institute
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Course Combobox Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="course_id"
                  render={({ field }) => {
                    const [open, setOpen] = React.useState(false);
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mt-[10px]">
                          Course Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[250px] justify-between "
                              >
                                {field.value
                                  ? courses.find(
                                      (course) =>
                                        course.id.toString() === field.value
                                    )?.medium_title
                                  : "Select Course..."}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                              <Command>
                                <CommandInput placeholder="Search course..." />
                                <CommandList>
                                  <CommandEmpty>
                                    {loading
                                      ? "Loading courses..."
                                      : "No course found."}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {courses.map((course) => (
                                      <CommandItem
                                        key={course.id}
                                        value={course.id.toString()}
                                        onSelect={(currentValue) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        {course.medium_title}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === course.id.toString()
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Semester and Standard Fields */}
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Semester <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Semester..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="standard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Standard <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Standard..." {...field} />
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
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Semester
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  return (
    <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5 text-white" />
        Back
      </Button>

      <CardHeader>
        <CardTitle>Semester Master</CardTitle>
        <CardDescription>Add Semester</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
