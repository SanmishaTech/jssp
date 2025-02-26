import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Updated schema to include only fields used in the form.
const divisionFormSchema = z.object({
  course_id: z.string().nonempty("Course is required"),
  division: z.string().nonempty("Division is required"),
});

type DivisionFormValues = z.infer<typeof divisionFormSchema>;

const defaultValues: DivisionFormValues = {
  course_id: "",
  division: "",
};

function DivisionForm() {
  const form = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Retrieve user and token from localStorage.
  const user = localStorage.getItem("user");
  const User = user ? JSON.parse(user) : {};
  const token = localStorage.getItem("token");

  // State for courses and loading status.
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(data: DivisionFormValues) {
    const payload = { ...data, userId: User?._id };
    try {
      await axios.post(`/api/divisions`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Division Created Successfully");
      window.history.back();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            form.setError(field as keyof DivisionFormValues, {
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
        const coursesData = response.data.data.Course || [];
        setCourses(coursesData);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        <div className="space-y-6">
          <Card className="max-w-full p-4">
            <CardHeader>
              <CardTitle>Division Information</CardTitle>
              <CardDescription>
                Create the Division for this Institute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
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
                                className="w-[250px] justify-between"
                              >
                                {field.value
                                  ? courses.find(
                                      (course: any) =>
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
                                    {courses.map((course: any) => (
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

                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Division <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Division..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3">
          <Button
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Division
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
        <CardTitle>Institutes Master</CardTitle>
        <CardDescription>Add Institute</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <DivisionForm />
        </div>
      </CardContent>
    </Card>
  );
}
