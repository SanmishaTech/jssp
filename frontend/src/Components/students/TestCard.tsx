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
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
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

// Combined schema with course, room, division, semester dropdown, and semester text.
const formSchema = z.object({
  student_name: z.string().nonempty("Student Name is required"),
  prn: z.string().nonempty("PRN is required"),
  subject_id: z.string().nonempty("Subject is required"),
  division_id: z.string().nonempty("Division is required"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  student_name: "",
  prn: "",
  subject_id: "",
  division_id: "",
};

export default function SettingsProfilePage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Retrieve user and token from localStorage
  const user = localStorage.getItem("user");
  const User = user ? JSON.parse(user) : {};
  const token = localStorage.getItem("token");

  // States for courses, rooms, and semesters.
  const [courses, setCourses] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(false);
  const [loadingRooms, setLoadingRooms] = React.useState(false);

  // Fetch courses from /api/all_courses.
  React.useEffect(() => {
    setLoadingCourses(true);
    axios
      .get("/api/all_subjects", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const coursesData = response.data.data.Subject || [];
        setCourses(coursesData);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      })
      .finally(() => setLoadingCourses(false));
  }, [token]);

  // Fetch rooms from /api/rooms.
  React.useEffect(() => {
    setLoadingRooms(true);
    axios
      .get("/api/all_divisions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const roomsData = response.data.data.Division || [];
        setRooms(roomsData);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to fetch rooms");
      })
      .finally(() => setLoadingRooms(false));
  }, [token]);

  async function onSubmit(data: FormValues) {
    // Prepare payload with all required fields
    const payloadDivision = {
      student_name: data.student_name,
      prn: data.prn,
      subject_id: data.subject_id,
      division_id: data.division_id,
      userId: User?._id,
    };

    try {
      await axios.post("/api/students", payloadDivision, {
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
            form.setError(field as keyof FormValues, {
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
    <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5 text-white" /> Back
      </Button>
      <CardHeader>
        <CardTitle>Student Master</CardTitle>
        <CardDescription>Add Student</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pb-[2rem]"
          >
            {/* Row 1: Course Title and Room Title */}
            <div className=" grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="student_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Student Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Student Name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      PRN <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="PRN..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Division Field */}
              <FormField
                control={form.control}
                name="division_id"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  return (
                    <FormItem className="">
                      <FormLabel className="">
                        Division <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              {field.value
                                ? rooms.find((room) => {
                                    const roomId = room.id?.toString() || "";
                                    return roomId === field.value;
                                  })?.division || "Select Division..."
                                : "Select Division..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Search division..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingRooms
                                    ? "Loading divisions..."
                                    : "No division found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {rooms.map((room) => {
                                    const roomId = room.id?.toString() || "";
                                    return (
                                      <CommandItem
                                        key={roomId}
                                        value={roomId}
                                        onSelect={(currentValue) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        {room.division}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === roomId
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    );
                                  })}
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

              {/* Course Title Field */}
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  return (
                    <FormItem className="flex-1">
                      <FormLabel className="mt-[0px]">
                        Subject <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              {field.value
                                ? courses.find((course) => {
                                    const courseId =
                                      course.id?.toString() || "";
                                    return courseId === field.value;
                                  })?.subject_name || "Select Subject..."
                                : "Select Subject..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Search subject..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingCourses
                                    ? "Loading subjects..."
                                    : "No subject found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {courses.map((course) => {
                                    const courseId =
                                      course.id?.toString() || "";
                                    return (
                                      <CommandItem
                                        key={courseId}
                                        value={courseId}
                                        onSelect={(currentValue) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        {course.subject_name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === courseId
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    );
                                  })}
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
            </div>

            {/* Students Field */}

            {/* Submission Buttons */}
            <div className="flex justify-end w-full gap-3">
              <Button
                onClick={() => window.history.back()}
                className="self-center"
                type="button"
              >
                Cancel
              </Button>
              <Button className="self-center mr-8" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
