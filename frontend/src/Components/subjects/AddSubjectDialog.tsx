import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const profileFormSchema = z.object({
  subject_name: z.string().trim().nonempty("Subject Name is Required"),
  course_id: z.string().nonempty("Course is Required"),
  semester_id: z.string().nonempty("Semester is Required"),
  sub_subjects: z.array(
    z.object({
      sub_subject_name: z.string().trim().nonempty("Sub-Subject Name is Required"),
    })
  ),
  userId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface Course {
  id: string | number;
  faculty_title: string;
}

interface Semester {
  id: string | number;
  semester: string;
  course_name?: string;
  course?: {
    id: number;
    faculty_title: string;
  };
}

interface AddSubjectDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
}

export default function AddSubjectDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
}: AddSubjectDialogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const defaultValues: Partial<ProfileFormValues> = {
    subject_name: "",
    course_id: "",
    semester_id: "",
    sub_subjects: [{ sub_subject_name: "" }],
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "sub_subjects",
    control: form.control,
  });

  const onClose = () => {
    onOpen(false);
    form.reset();
  };

  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Access courses from data.Course based on API response structure
        let coursesData = [];
        if (response.data && response.data.data && response.data.data.Course) {
          if (Array.isArray(response.data.data.Course)) {
            coursesData = response.data.data.Course;
          }
        }
        
        setCourses(coursesData);
      } catch (error) {
        toast.error("Failed to fetch courses");
        console.error(error);
      }
    };

    const fetchSemesters = async () => {
      try {
        const response = await axios.get('/api/semesters', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Extract semesters from response
        let semestersData = [];
        if (response.data && response.data.data) {
          if (Array.isArray(response.data.data)) {
            semestersData = response.data.data;
          } else if (response.data.data.Semester && Array.isArray(response.data.data.Semester)) {
            semestersData = response.data.data.Semester;
          }
        }
        
        setSemesters(semestersData);
      } catch (error) {
        toast.error("Failed to fetch semesters");
        console.error(error);
      }
    };

    if (isOpen) {
      fetchCourses();
      fetchSemesters();
    }
  }, [isOpen, token]);

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    try {
      await axios.post(`/api/subjects`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Subject Created Successfully");
      onClose();
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          // Handle validation errors
          Object.entries(errorData.errors).forEach(([field, messages]) => {
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

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <Modal size="2xl" backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add New Subject
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Fields in 3-column layout */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Subject Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...form.register("subject_name")}
                      className="w-full rounded-md border border-gray-300 p-2"
                      placeholder="Enter subject name"
                    />
                    {form.formState.errors.subject_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.subject_name.message}
                      </p>
                    )}
                  </div>

                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...form.register("course_id")}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select Course...</option>
                        {Array.isArray(courses) && courses.map((course) => (
                          <option
                            key={course.id ? course.id.toString() : ''}
                            value={course.id ? course.id.toString() : ''}
                          >
                            {course.faculty_title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {form.formState.errors.course_id && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.course_id.message}
                      </p>
                    )}
                  </div>

                  {/* Semester Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...form.register("semester_id")}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select Semester...</option>
                        {Array.isArray(semesters) && semesters.map((semester) => (
                          <option
                            key={semester.id ? semester.id.toString() : ''}
                            value={semester.id ? semester.id.toString() : ''}
                          >
                            {semester.semester}
                          </option>
                        ))}
                      </select>
                    </div>
                    {form.formState.errors.semester_id && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.semester_id.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub-Subjects Table */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Sub-Subjects</h3>
                  <div className="space-y-3">
                    {/* Display sub-subjects in pairs */}
                    {[...Array(Math.ceil(fields.length / 2))].map((_, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-2 gap-4">
                        {/* First sub-subject in pair */}
                        {fields[rowIndex * 2] && (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <input
                                {...form.register(
                                  `sub_subjects.${rowIndex * 2}.sub_subject_name`
                                )}
                                className="w-full rounded-md border border-gray-300 p-2"
                                placeholder="Sub-Subject Name"
                              />
                              {form.formState.errors.sub_subjects?.[rowIndex * 2]
                                ?.sub_subject_name && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    form.formState.errors.sub_subjects[rowIndex * 2]
                                      ?.sub_subject_name?.message
                                  }
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              color="danger"
                              variant="light"
                              onPress={() => remove(rowIndex * 2)}
                              className="flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Second sub-subject in pair */}
                        {fields[rowIndex * 2 + 1] && (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <input
                                {...form.register(
                                  `sub_subjects.${rowIndex * 2 + 1}.sub_subject_name`
                                )}
                                className="w-full rounded-md border border-gray-300 p-2"
                                placeholder="Sub-Subject Name"
                              />
                              {form.formState.errors.sub_subjects?.[rowIndex * 2 + 1]
                                ?.sub_subject_name && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    form.formState.errors.sub_subjects[rowIndex * 2 + 1]
                                      ?.sub_subject_name?.message
                                  }
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              color="danger"
                              variant="light"
                              onPress={() => remove(rowIndex * 2 + 1)}
                              className="flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Button */}
                    <div className="w-full mt-3">
                      <Button
                        type="button"
                        color="primary"
                        variant="light"
                        onPress={() => append({ sub_subject_name: "" })}
                        className="w-full"
                      >
                        Add Sub-Subject
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Save Subject
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
