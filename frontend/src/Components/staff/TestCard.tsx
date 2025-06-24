import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CourseSelect } from "@/components/ui/course-select";
import { SemesterSelect } from "@/components/ui/semester-select";
import { SubjectSelect } from "@/components/ui/subject-select";
import dayjs from "dayjs";
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

import { useState, useEffect } from "react";

const profileFormSchema = z.object({
  staff_name: z.string().nonempty("Name is Required"),
  employee_code: z.string().nonempty("Employee Code is Required"),
   date_of_birth: z.any().optional(),
   academic_years_id: z.any().optional(),
  address: z.string().nonempty("Address is Required"),
  mobile: z.string().optional(),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
  role: z.string().nonempty("Role is required"),
  course_id: z.array(z.object({
    key: z.string(),
    name: z.string()
  })).optional().default([]), // Changed to array for multiple selection
  
  semester_id: z.array(z.object({
    key: z.string(),
    name: z.string()
  })).optional().default([]), // Similar to course_id for multiple semester selection
  
  subject_id: z.array(z.object({
    key: z.string(),
    name: z.string()
  })).optional().default([]), // Similar to course_id for multiple subject selection

  images: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  userId?: string;
  name?: string;
};

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  role: "nonteachingstaff", // Default role to 'member'
  course_id: [], // Default empty course_id array
  semester_id: [], // Default empty semester_id array
  subject_id: [], // Default empty subject_id array
  // Initialize other fields to prevent uncontrolled to controlled warnings
  staff_name: "",
  academic_years_id: "",
  employee_code: "",
   address: "",
  mobile: "",
  email: "",
  password: ""
};

function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    
    mode: "onChange",
  });
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");
  //   const { fields, append } = useFieldArray({
  //     name: "urls",
  //     control: form.control,
  //   });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [courses, setCourses] = useState<{key: string, name: string}[]>([]);
  const [semesters, setSemesters] = useState<{key: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<{key: string, name: string}[]>([]);
  const [academicYears, setAcademicYears] = useState<{id: number, academic_year: string}[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<{key: string, name: string}[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<{key: string, name: string}[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<{key: string, name: string}[]>([]);
  const [isTeachingStaff, setIsTeachingStaff] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 5 images
      const newFiles = files.slice(0, 5 - selectedImages.length);
      setSelectedImages([...selectedImages, ...newFiles]);

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  // Custom tag renderer for MultipleSelect
  const customTag = (item: {key: string, name: string}) => {
    return (
      <div className="flex items-center">
        <span>{item.name}</span>
      </div>
    );
  };

  // Fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Course API response:', response.data);
        
        // Handle the specific response structure
        if (response.data?.status && response.data?.data?.Course && Array.isArray(response.data.data.Course)) {
          // Map the course data to the format expected by MultipleSelect
          const mappedCourses = response.data.data.Course.map((course: { id: number, faculty_title?: string, faculty_code?: string }) => ({
            key: String(course.id),
            name: course.faculty_title || course.faculty_code || 'Unnamed Course'
          }));
          
          console.log('Mapped courses:', mappedCourses);
          setCourses(mappedCourses);
        } else {
          console.log('Unexpected response structure:', response.data);
          toast.error('Could not find courses in the response');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };

    const fetchSemesters = async () => {
      try {
        const response = await axios.get('/api/semesters', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Semester API response:', response.data);
        
        // Handle the specific response structure for semesters (might be different from courses)
        if (response.data?.status && response.data?.data?.Semester && Array.isArray(response.data.data.Semester)) {
          // Map the semester data to the format expected by MultipleSelect based on the actual API response
          const mappedSemesters = response.data.data.Semester.map((semester: { 
            id: number, 
            semester: string, 
            course_name: string 
          }) => ({
            key: String(semester.id),
            name: semester.semester || 'Unnamed Semester'
          }));
          
          console.log('Mapped semesters:', mappedSemesters);
          setSemesters(mappedSemesters);
        } else {
          console.log('Unexpected semester response structure:', response.data);
          // Don't show error toast for semesters to avoid multiple errors if API is not ready
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        // Don't show error toast for semesters to avoid multiple errors if API is not ready
      }
    };
    
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/api/subjects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Subject API response:', response.data);
        
        // Handle the specific response structure for subjects
        if (response.data?.status && response.data?.data?.Subject && Array.isArray(response.data.data.Subject)) {
          // Map the subject data to the format expected by SubjectSelect
          const mappedSubjects = response.data.data.Subject.map((subject: { 
            id: number, 
            subject_name: string,
            subject_code: string
          }) => ({
            key: String(subject.id),
            name: subject.subject_name || subject.subject_code || 'Unnamed Subject'
          }));
          
          console.log('Mapped subjects:', mappedSubjects);
          setSubjects(mappedSubjects);
        } else {
          console.log('Unexpected subject response structure:', response.data);
          // Don't show error toast to avoid multiple errors if API is not ready
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        // Don't show error toast to avoid multiple errors if API is not ready
      }
    };

    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get('/api/all_academic_years', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Academic Years API response:', response.data);
        
        // Handle the specific response structure for academic years
        if (response.data?.status && response.data?.data?.AcademicYears && Array.isArray(response.data.data.AcademicYears)) {
          // Map the academic year data to the format expected by the select element
          const mappedAcademicYears = response.data.data.AcademicYears.map((year: { 
            id: number, 
            academic_year: string 
          }) => ({
            id: year.id,
            academic_year: year.academic_year || 'Unnamed Academic Year'
          }));
          
          console.log('Mapped academic years:', mappedAcademicYears);
          setAcademicYears(mappedAcademicYears);
        } else {
          console.log('Unexpected academic years response structure:', response.data);
          // Don't show error toast to avoid multiple errors if API is not ready
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
        // Don't show error toast to avoid multiple errors if API is not ready
      }
    };

    if (token) {
      fetchCourses();
      fetchSemesters();
      fetchSubjects();
      fetchAcademicYears();
    }
  }, [token]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Load course and semester data when API data is available
  useEffect(() => {
    if (courses.length > 0) {
      const courseValue = form.getValues('course_id');
      if (courseValue) {
        setSelectedCourses(courseValue);
      }
    }
  }, [courses, form]);
  
  useEffect(() => {
    if (semesters.length > 0) {
      const semesterValue = form.getValues('semester_id');
      if (semesterValue) {
        setSelectedSemesters(semesterValue);
      }
    }
  }, [semesters, form]);
  
  useEffect(() => {
    if (subjects.length > 0) {
      const subjectValue = form.getValues('subject_id');
      if (subjectValue) {
        setSelectedSubjects(subjectValue);
      }
    }
  }, [subjects, form]);

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    data.name = data.staff_name;

    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key !== "images" && key !== "course_id" && key !== "semester_id" && key !== "subject_id") {
          // Use type assertion to safely access dynamic properties
          formData.append(key, (data as any)[key]);
        }
      });
      
      // Handle course_id array separately
      if (data.course_id && Array.isArray(data.course_id) && data.course_id.length > 0) {
        // Extract just the course IDs from the objects
        const courseIds = data.course_id.map(course => {
          // If it's an object with a key property, return the key
          if (typeof course === 'object' && course !== null && 'key' in course) {
            return course.key;
          }
          // If it's already just a string ID, return it directly
          return course;
        });
        
        // Send the course IDs as a JSON string
        formData.append('course_id', JSON.stringify(courseIds));
        console.log('Course IDs being sent:', courseIds);
      } else {
        // If no courses selected, send an empty array
        formData.append('course_id', JSON.stringify([]));
      }
      
      // Handle semester_id array separately (similar to course_id)
      if (data.semester_id && Array.isArray(data.semester_id) && data.semester_id.length > 0) {
        // Extract just the semester IDs from the objects
        const semesterIds = data.semester_id.map(semester => {
          // If it's an object with a key property, return the key
          if (typeof semester === 'object' && semester !== null && 'key' in semester) {
            return semester.key;
          }
          // If it's already just a string ID, return it directly
          return semester;
        });
        
        // Send the semester IDs as a JSON string
        formData.append('semester_id', JSON.stringify(semesterIds));
        console.log('Semester IDs being sent:', semesterIds);
      } else {
        // If no semesters selected, send an empty array
        formData.append('semester_id', JSON.stringify([]));
      }
      
      // Handle subject_id array separately (similar to course_id and semester_id)
      if (data.subject_id && Array.isArray(data.subject_id) && data.subject_id.length > 0) {
        // Extract just the subject IDs from the objects
        const subjectIds = data.subject_id.map(subject => {
          // If it's an object with a key property, return the key
          if (typeof subject === 'object' && subject !== null && 'key' in subject) {
            return subject.key;
          }
          // If it's already just a string ID, return it directly
          return subject;
        });
        
        // Send the subject IDs as a JSON string
        formData.append('subject_id', JSON.stringify(subjectIds));
        console.log('Subject IDs being sent:', subjectIds);
      } else {
        // If no subjects selected, send an empty array
        formData.append('subject_id', JSON.stringify([]));
      }

      // Append each selected image to the FormData
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      await axios.post(`/api/staff`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff Master Created Successfully");
      window.history.back();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { errors, message } = error.response.data; // Extract validation errors

        if (errors) {
          // Loop through backend validation errors and set them in the form
          Object.keys(errors).forEach((key) => {
            form.setError(key as keyof ProfileFormValues, {
              type: "server",
              message: errors[key][0], // First error message from array
            });

            // Show each validation error as a separate toast notification
            toast.error(errors[key][0]);
          });
        } else {
          // If no specific validation errors, show a generic message
          toast.error(message || "Something went wrong, please try again.");
        }
      } else {
        toast.error("Something went wrong, please try again.");
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        <div className="max-w-full p-4 space-y-6">
          {/* Staff Information Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Information</CardTitle>
                </div>
                 
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-5 space-y-3">
                <FormField
                  control={form.control}
                  name="staff_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center min-h-[100px]">
                      <FormLabel className="">Name<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee_code"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel >Employee Code<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Employee Code..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  rules={{
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/, // Ensures exactly 10 numeric digits
                      message:
                        "Mobile number must be exactly 10 digits and contain only numbers",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10} // Prevents input beyond 10 characters
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, ""); // Removes non-numeric characters
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "role"> }) => (
                    <FormItem className="">
                      <FormLabel>Role<span className="text-red-500">*</span></FormLabel>
                      <Select 
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          const isTeaching = value === "teachingstaff";
                          setIsTeachingStaff(isTeaching);
                          
                          // If changing from teaching staff to another role, clear related fields
                          if (!isTeaching) {
                            // Clear academic year
                            form.setValue('academic_years_id', "", {
                              shouldDirty: true,
                              shouldTouch: true
                            });
                            
                            // Clear courses
                            setSelectedCourses([]);
                            form.setValue('course_id', [], {
                              shouldDirty: true,
                              shouldTouch: true
                            });
                            
                            // Clear semesters
                            setSelectedSemesters([]);
                            form.setValue('semester_id', [], {
                              shouldDirty: true,
                              shouldTouch: true
                            });
                            
                            // Clear subjects
                            setSelectedSubjects([]);
                            form.setValue('subject_id', [], {
                              shouldDirty: true,
                              shouldTouch: true
                            });
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="viceprincipal">Vice Principal</SelectItem>
                          <SelectItem value="teachingstaff">Teaching Staff</SelectItem>
                          <SelectItem value="nonteachingstaff">Non-Teaching Staff</SelectItem>
                          <SelectItem value="admission">Admission</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                           <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="librarian">Librarian</SelectItem>
                          <SelectItem value="storekeeper">Store Keeper</SelectItem>
                          <SelectItem value="hod">HOD</SelectItem>
                          <SelectItem value="officesuperintendent">Office SuperIntendent</SelectItem>
                          <SelectItem value="examhead">Exam Head</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
  control={form.control}
  name="date_of_birth"
  render={({ field }) => {
    // Calculate the date 18 years ago
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    const maxDate = eighteenYearsAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    return (
      <FormItem>
        <FormLabel>
          Date of Birth<span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input
            id="date_of_birth"
            type="date"
            max={maxDate} // Limit to 18 years ago
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>

                {isTeachingStaff && (
                  <div className="flex gap-5">
                      <FormField
                    control={form.control}
                    name="academic_years_id"
                    render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "academic_years_id"> }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Academic Year<span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((academicYear) => (
                              <SelectItem
                                key={academicYear.id.toString()}
                                value={academicYear.id.toString()}
                              >
                                {academicYear.academic_year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   
                 
                
               
                  {/* Course selection completely isolated */}
                         <FormItem className="space-y-3">
                          <FormLabel>Courses</FormLabel>
                          <FormControl>
                            <CourseSelect
                              tags={courses}
                              onChange={(selectedItems: {key: string, name: string}[]) => {
                                // Only update the local state, not the form field directly
                                setSelectedCourses(selectedItems);
                                // Update the form value separately
                                form.setValue('course_id', selectedItems, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: false
                                });
                                console.log("Selected courses:", selectedItems);
                              }}
                              defaultValue={selectedCourses}
                              placeholder="Select courses"
                              customTag={customTag}
                              emptyIndicator={
                                <p className="text-center text-muted-foreground py-6 text-sm">
                                  No courses available.
                                </p>
                              }
                            />
                          </FormControl>
                          {form.formState.errors.course_id && (
                            <div className="text-sm text-red-500">
                              {String(form.formState.errors.course_id.message)}
                            </div>
                          )}
                        </FormItem>
                       
                      
                      {/* Semester selection completely isolated */}
                         <FormItem className="space-y-3">
                          <FormLabel>Semesters</FormLabel>
                          <FormControl>
                            <SemesterSelect
                              tags={semesters}
                              onChange={(selectedItems: {key: string, name: string}[]) => {
                                // Only update the local state, not the form field directly
                                setSelectedSemesters(selectedItems);
                                // Update the form value separately
                                form.setValue('semester_id', selectedItems, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: false
                                });
                                console.log("Selected semesters:", selectedItems);
                              }}
                              defaultValue={selectedSemesters}
                              placeholder="Select semesters"
                              customTag={customTag}
                              emptyIndicator={
                                <p className="text-center text-muted-foreground py-6 text-sm">
                                  No semesters available.
                                </p>
                              }
                            />
                          </FormControl>
                          {form.formState.errors.semester_id && (
                            <div className="text-sm text-red-500">
                              {String(form.formState.errors.semester_id.message)}
                            </div>
                          )}
                        </FormItem>
                       
                      {/* Subject selection completely isolated */}
                      <div className="w-full">
                      <FormItem className="space-y-3">
                        <FormLabel>Subjects</FormLabel>
                        <FormControl>
                          <SubjectSelect
                            tags={subjects}
                            onChange={(selectedItems: {key: string, name: string}[]) => {
                              // Only update the local state, not the form field directly
                              setSelectedSubjects(selectedItems);
                              // Update the form value separately
                              form.setValue('subject_id', selectedItems, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: false
                              });
                              console.log("Selected subjects:", selectedItems);
                            }}
                            defaultValue={selectedSubjects}
                            placeholder="Select subjects"
                            customTag={customTag}
                            emptyIndicator={
                              <p className="text-center text-muted-foreground py-6 text-sm">
                                No subjects available.
                              </p>
                            }
                          />
                        </FormControl>
                        {form.formState.errors.subject_id && (
                          <div className="text-sm text-red-500">
                            {String(form.formState.errors.subject_id.message)}
                          </div>
                        )}
                      </FormItem>
                    </div>
                </div>
                )}  
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>


          {/* Staff Images Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Staff Documents Images</CardTitle>
              <CardDescription>
                Upload up to 5 images (JPEG, PNG, JPG - Max 2MB each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleImageChange}
                  disabled={selectedImages.length >= 5}
                  value="" // Ensure it's always controlled with an empty string
                  key={`file-input-${selectedImages.length}`} // Force re-render when selectedImages changes
                />

                <div className="space-y-2 mt-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <a 
                        href={previewUrls[index]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {file.name}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="w-full ">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 ">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Email..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password<span className="text-red-500">*</span></FormLabel>
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
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Staff
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
        <CardTitle>Staff Master</CardTitle>
        <CardDescription>Add Staff Master</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 ">
          <ProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
