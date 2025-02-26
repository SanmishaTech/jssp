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
  course_id: z.string().nonempty("Course is required"),
  room_id: z.string().nonempty("Room is required"),
  semester_id: z.string().nonempty("Semester Title is required"),
  semester: z.string().nonempty("Semester is required"),
  division: z.string().nonempty("Division is required"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  course_id: "",
  room_id: "",
  semester_id: "",
  semester: "",
  division: "",
};

export default function SettingsProfilePage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Retrieve user and token from localStorage.
  const user = localStorage.getItem("user");
  const User = user ? JSON.parse(user) : {};
  const token = localStorage.getItem("token");

  // States for courses, rooms, and semesters.
  const [courses, setCourses] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [semesters, setSemesters] = React.useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(false);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [loadingSemesters, setLoadingSemesters] = React.useState(false);

  // Fetch courses from /api/all_courses.
  React.useEffect(() => {
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

  // Fetch rooms from /api/rooms.
  React.useEffect(() => {
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

  // Fetch semesters from /api/semesters.
  React.useEffect(() => {
    setLoadingSemesters(true);
    axios
      .get("/api/semesters", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const semestersData = response.data.data.Semester;
        setSemesters(semestersData);
      })
      .catch((error) => {
        console.error("Error fetching semesters:", error);
        toast.error("Failed to fetch semesters");
      })
      .finally(() => setLoadingSemesters(false));
  }, [token]);

  async function onSubmit(data: FormValues) {
    // Prepare payloads.
    const payloadDivision = {
      course_id: data.course_id,
      division: data.division,
      userId: User?._id,
    };
    const payloadRoom = {
      room_id: data.room_id,
      userId: User?._id,
    };
    const payloadSemester = {
      semester_id: data.semester_id,
      semester: data.semester,
      userId: User?._id,
    };

    try {
      await Promise.all([
        axios.post("/api/divisions", payloadDivision, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.post("/api/rooms", payloadRoom, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.post("/api/semesters", payloadSemester, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      toast.success("Division, Room and Semester Created Successfully");
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
        <CardTitle>Division Master</CardTitle>
        <CardDescription>
          Add Institute Division, Room & Semester
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pb-[2rem]"
          >
            {/* Row 1: Course Title and Room Title */}
            <div className="flex gap-4">
              {/* Course Title Field */}
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  return (
                    <FormItem className="flex-1">
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
                              className="w-full justify-between"
                            >
                              {field.value
                                ? courses.find((course) => {
                                    const courseId =
                                      course.id != null
                                        ? course.id.toString()
                                        : "";
                                    return courseId === field.value;
                                  })?.medium_title || "Select Course..."
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
                                  {courses.map((course) => {
                                    const courseId =
                                      course.id != null
                                        ? course.id.toString()
                                        : "";
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
                                        {course.medium_title}
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

              {/* Room Title Field */}
              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  return (
                    <FormItem className="flex-1">
                      <FormLabel className="mt-[10px]">
                        Room Title <span className="text-red-500">*</span>
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
                                    const roomId = room.room_id ?? room.id;
                                    return roomId != null
                                      ? roomId.toString() === field.value
                                      : false;
                                  })?.room_name || "Select Room..."
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
                                  {rooms.map((room) => {
                                    const roomId = room.room_id ?? room.id;
                                    const roomIdStr =
                                      roomId != null ? roomId.toString() : "";
                                    return (
                                      <CommandItem
                                        key={roomIdStr}
                                        value={roomIdStr}
                                        onSelect={(currentValue) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        {room.room_name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === roomIdStr
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

              {/* Semester Title Field */}
              <FormField
                control={form.control}
                name="semester_id"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  return (
                    <FormItem className="flex-1">
                      <FormLabel className="mt-[10px]">
                        Semester Title <span className="text-red-500">*</span>
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
                                ? semesters.find((sem) => {
                                    const semId = sem.semester_id ?? sem.id;
                                    return semId != null
                                      ? semId.toString() === field.value
                                      : false;
                                  })?.semester || "Select Semester..."
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
                                  {semesters.map((sem) => {
                                    const semId = sem.semester_id ?? sem.id;
                                    const semIdStr =
                                      semId != null ? semId.toString() : "";
                                    return (
                                      <CommandItem
                                        key={semIdStr}
                                        value={semIdStr}
                                        onSelect={(currentValue) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        {sem.semester}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === semIdStr
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

            {/* Division Field (Below the rows) */}
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
