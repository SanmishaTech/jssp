import React, { useState, useEffect } from "react";
// import { Link, Navigate } from "react-router-dom";
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
  CardFooter,
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

// Define interfaces for our data types
interface Course {
  id: number;
  medium_title: string;
}

interface Room {
  id: number;
  room_name: string;
}

interface Semester {
  id: number;
  semester: string;
}

const formSchema = z.object({
  course_id: z.string().nonempty("Course is required"),
  room_id: z.string().nonempty("Room is required"),
  semester_id: z.string().nonempty("Semester Title is required"),
  division: z.string().nonempty("Division is required"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  course_id: "",
  room_id: "",
  semester_id: "",
  division: "",
};

function ProfileForm({ formData }: { formData: FormValues }) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: formData, // Use values instead of defaultValues
    mode: "onChange",
  });

  const { id } = useParams({ from: "/divisions/edit/$id" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // States for courses, rooms, and semesters
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Fetch courses
  useEffect(() => {
    setLoadingCourses(true);
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
      .finally(() => setLoadingCourses(false));
  }, [token]);

  // Fetch rooms
  useEffect(() => {
    setLoadingRooms(true);
    axios
      .get("/api/rooms", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const roomsData = response.data.data.Room || [];
        setRooms(roomsData);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to fetch rooms");
      })
      .finally(() => setLoadingRooms(false));
  }, [token]);

  // Fetch semesters
  useEffect(() => {
    setLoadingSemesters(true);
    axios
      .get("/api/semesters", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const semestersData = response.data.data.Semester || [];
        setSemesters(semestersData);
      })
      .catch((error) => {
        console.error("Error fetching semesters:", error);
        toast.error("Failed to fetch semesters");
      })
      .finally(() => setLoadingSemesters(false));
  }, [token]);

  // Reset form when formData changes
  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form]);

  async function onSubmit(data: FormValues) {
    try {
      const response = await axios.put(`/api/divisions/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        toast.success("Division Updated Successfully");
        navigate({ to: "/divisions" });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;

        if (errorData?.errors) {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            form.setError(field as keyof FormValues, {
              type: "server",
              message: message as string,
            });
            toast.error(message as string);
          });
        } else {
          toast.error(errorData?.message || "Failed to update division");
        }
      } else {
        toast.error("An unexpected error occurred");
        console.error("Update error:", error);
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
          <Card className="max-w-full p-4">
            <CardHeader>
              <CardTitle>Division Information</CardTitle>
              <CardDescription>Update division details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* Course Title Field */}
                <FormField
                  control={form.control}
                  name="course_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="mt-[10px]">
                        Course Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {field.value
                                ? courses.find(
                                    (course) =>
                                      course.id.toString() === field.value
                                  )?.medium_title || "Select Course..."
                                : "Select Course..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Search course..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingCourses
                                    ? "Loading courses..."
                                    : "No course found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {courses.map((course) => (
                                    <CommandItem
                                      key={course.id}
                                      value={course.id.toString()}
                                      onSelect={(value) => {
                                        field.onChange(
                                          value === field.value ? "" : value
                                        );
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
                  )}
                />

                {/* Room Title Field */}
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="mt-[10px]">
                        Room Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {field.value
                                ? rooms.find(
                                    (room) => room.id.toString() === field.value
                                  )?.room_name || "Select Room..."
                                : "Select Room..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Search room..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingRooms
                                    ? "Loading rooms..."
                                    : "No room found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {rooms.map((room) => (
                                    <CommandItem
                                      key={room.id}
                                      value={room.id.toString()}
                                      onSelect={(value) => {
                                        field.onChange(
                                          value === field.value ? "" : value
                                        );
                                      }}
                                    >
                                      {room.room_name}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          field.value === room.id.toString()
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
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="mt-[10px]">
                        Semester Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {field.value
                                ? semesters.find(
                                    (semester) =>
                                      semester.id.toString() === field.value
                                  )?.semester || "Select Semester..."
                                : "Select Semester..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Search semester..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingSemesters
                                    ? "Loading semesters..."
                                    : "No semester found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {semesters.map((semester) => (
                                    <CommandItem
                                      key={semester.id}
                                      value={semester.id.toString()}
                                      onSelect={(value) => {
                                        field.onChange(
                                          value === field.value ? "" : value
                                        );
                                      }}
                                    >
                                      {semester.semester}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          field.value === semester.id.toString()
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
                  )}
                />
              </div>

              {/* Division Field */}
              <div className="mt-4">
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
            onClick={() => navigate({ to: "/divisions" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Division
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/divisions/edit/$id" });
  const [formData, setFormData] = useState<FormValues>({
    course_id: "",
    room_id: "",
    semester_id: "",
    division: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/divisions/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const divisionData = response.data.data.Division;

        if (!divisionData) {
          throw new Error("No data received from API");
        }

        // Map the data according to the actual API response structure
        const formattedData = {
          course_id: String(divisionData.courses_id || ""),
          room_id: String(divisionData.room_id || ""),
          semester_id: String(divisionData.semester_id || ""),
          division: divisionData.division || "",
        };

        setFormData(formattedData);
      } catch (error) {
        console.error("Error fetching division:", error);
        toast.error("Failed to fetch division data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, token]);

  if (isLoading) {
    return (
      <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4">
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <div>Loading division data...</div>
        </CardContent>
      </Card>
    );
  }

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
        <CardTitle>Division Master</CardTitle>
        <CardDescription>Edit/Update the Division</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
    </Card>
  );
}
