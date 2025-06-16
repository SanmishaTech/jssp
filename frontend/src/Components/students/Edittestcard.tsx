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
  student_name: z.string().nonempty("Student Name is required"),
  prn: z.string().nonempty("PRN is required"),
  abcId: z.string().optional(),
  division_id: z.string().nonempty("Division is required"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  student_name: "",
  prn: "",
  abcId: "",
  division_id: "",
};

function ProfileForm({ formData }: { formData: FormValues }) {
  console.log("Form Data received:", formData); // Debug log

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: formData, // Use values instead of defaultValues
    mode: "onChange",
  });

  const { id } = useParams({ from: "/students/edit/$id" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // States for courses, rooms, and semesters
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);

  // Fetch courses
  useEffect(() => {
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
        console.error("Error fetching subjects:", error);
        toast.error("Failed to fetch subjects");
      })
      .finally(() => setLoadingCourses(false));
  }, [token]);

  // Fetch rooms
  useEffect(() => {
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
        console.error("Error fetching divisions:", error);
        toast.error("Failed to fetch divisions");
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
    console.log("Resetting form with data:", formData); // Debug log
    if (formData) {
      form.reset(formData);
      
      // Set the selected division when form data is loaded
      if (formData.division_id) {
        const divisionData = rooms.find(room => room.id?.toString() === formData.division_id);
        setSelectedDivision(divisionData || null);
      }
    }
  }, [formData, form, rooms]);

  async function onSubmit(data: FormValues) {
    try {
      const response = await axios.put(`/api/students/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        toast.success("Student Updated Successfully");
        navigate({ to: "/students" });
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
          toast.error(errorData?.message || "Failed to update students");
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
        <div className=" grid grid-cols-3 gap-3">
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
          <FormField
            control={form.control}
            name="abcId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  ABC ID 
                </FormLabel>
                <FormControl>
                  <Input placeholder="ABC ID..." {...field} />
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
                                      // Set the selected division when a division is selected
                                      const selectedDiv = rooms.find(room => room.id?.toString() === (currentValue === field.value ? "" : currentValue));
                                      setSelectedDivision(selectedDiv || null);
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

        
        </div>

        {/* Division Details Section */}
        {selectedDivision && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Division Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Division Name</p>
                <p>{selectedDivision.division}</p>
              </div>
              {selectedDivision.institute_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Institute</p>
                  <p>{selectedDivision.institute_name}</p>
                </div>
              )}
              {selectedDivision.course_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p>{selectedDivision.course_name}</p>
                </div>
              )}
              {selectedDivision.semester_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Semester</p>
                  <p>{selectedDivision.semester_name}</p>
                </div>
              )}
              {selectedDivision.room_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Room</p>
                  <p>{selectedDivision.room_name}</p>
                </div>
              )}
              {selectedDivision.semester && !selectedDivision.semester_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Semester</p>
                  <p>{selectedDivision.semester}</p>
                </div>
              )}
              {selectedDivision.batch && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Batch</p>
                  <p>{selectedDivision.batch}</p>
                </div>
              )}
              {selectedDivision.year && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p>{selectedDivision.year}</p>
                </div>
              )}
              {selectedDivision.description && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p>{selectedDivision.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end w-full gap-3">
          <Button
            onClick={() => navigate({ to: "/students" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Student
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/students/edit/$id" });
  const [formData, setFormData] = useState<FormValues>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/students/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const studentData = response.data.data.Student;
        console.log("Raw API Response:", response.data); // Debug log
        console.log("Student Data:", studentData); // Debug log

        if (!studentData) {
          throw new Error("No data received from API");
        }

        // Map the data according to the actual API response structure
        const formattedData = {
          student_name: studentData.student_name || "",
          prn: studentData.prn || "",
          subject_id: String(studentData.subject_id || ""),
          division_id: String(studentData.division_id || ""),
        };

        console.log("Formatted Data:", formattedData); // Debug log
        setFormData(formattedData);
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Failed to fetch student data");
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
          <div>Loading student data...</div>
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
        <CardTitle>Student Master</CardTitle>
        <CardDescription>Edit/Update the Student</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
    </Card>
  );
}
