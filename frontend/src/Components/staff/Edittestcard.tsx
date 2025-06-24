import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseSelect } from "@/components/ui/course-select";
import { SemesterSelect } from "@/components/ui/semester-select";
import { SubjectSelect } from "@/components/ui/subject-select";

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

const profileFormSchema = z.object({
  staff_name: z.string().nonempty("Staff Name Required"),
  employee_code: z.string().nonempty("Employee Code Required"),
   date_of_birth: z.any().optional(),
   academic_years_id: z.any().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
  role: z.string().optional(),
  course_id: z.array(z.any()).optional(), // Added course_id array field
  semester_id: z.array(z.any()).optional(), // Added semester_id array field
  subject_id: z.array(z.any()).optional(), // Added subject_id array field
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.any().optional(),
  images: z.any().optional(),
  delete_existing_images: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  name?: string;
};

// This can come from your database or API.

function ProfileForm({ formData }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const { id } = useParams({ from: "/staff/edit/$id" });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [courses, setCourses] = useState<{key: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<{key: string, name: string}[]>([]);
  const [academicYears, setAcademicYears] = useState<{id: number, academic_year: string}[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<{key: string, name: string}[]>([]);
  const [isTeachingStaff, setIsTeachingStaff] = useState<boolean>(false);

  const { reset } = form;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Reset form values when formData changes
  useEffect(() => {
    // Process course_id and subject_id to match the format Select components expect
    if (formData) {
      const formDataCopy = { ...formData };
      
      // Check if this is a teaching staff and set the state accordingly
      if (formData.role === "teachingstaff") {
        setIsTeachingStaff(true);
      }
      
      // Handle course_id
      if (formData.course_id && Array.isArray(formData.course_id)) {
        // Store original course_id for reference (as IDs only)
        const originalCourseIds = formData.course_id;
         
        // We'll update this once courses are loaded
        formDataCopy.course_id = [];
        
        // Save the IDs to match with courses when they load
        sessionStorage.setItem('original_course_ids', JSON.stringify(originalCourseIds));
      }
      
      // Handle subject_id
      if (formData.subject_id && Array.isArray(formData.subject_id)) {
        // Store original subject_id for reference (as IDs only)
        const originalSubjectIds = formData.subject_id;
         
        // We'll update this once subjects are loaded
        formDataCopy.subject_id = [];
        
        // Save the IDs to match with subjects when they load
        sessionStorage.setItem('original_subject_ids', JSON.stringify(originalSubjectIds));
      }
      
      reset(formDataCopy);
    } else {
      reset(formData);
    }

    if (formData?.images) {
      // Map the images to ensure they have the right structure
      const processedImages = formData.images.map(img => ({
        ...img,
        // If the image_path is already correct, use it, otherwise ensure it's properly formatted
        image_path: img.image_path || (typeof img.url === 'string' ? img.url.split('/').pop() : `Image ${img.id}`)
      }));
      
      setExistingImages(processedImages);
      setDeletedImageIds([]);
    }
  }, [formData, reset]);

  // Store selected courses and semesters in state for better control
  const [selectedCourses, setSelectedCourses] = useState<{key: string, name: string}[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<{key: string, name: string}[]>([]);
  const [semesters, setSemesters] = useState<{key: string, name: string}[]>([]);

  // Fetch courses and semesters when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
         
        // Handle the specific response structure
        if (response.data?.status && response.data?.data?.Course && Array.isArray(response.data.data.Course)) {
          // Map the course data to the format expected by MultipleSelect
          const mappedCourses = response.data.data.Course.map((course: { id: number, faculty_title?: string, faculty_code?: string }) => ({
            key: String(course.id),
            name: course.faculty_title || course.faculty_code || 'Unnamed Course'
          }));
          
           setCourses(mappedCourses);
          
          // Get saved course IDs from session storage or directly from formData
          const courseIdsFromFormData = formData?.course_id || [];
           
          if (Array.isArray(courseIdsFromFormData) && courseIdsFromFormData.length > 0) {
            // If they're already objects with key/name, use them directly
            if (typeof courseIdsFromFormData[0] === 'object' && courseIdsFromFormData[0].key) {
               setSelectedCourses(courseIdsFromFormData);
              form.setValue('course_id', courseIdsFromFormData);
            } 
            // If they're strings (IDs), map them to objects
            else {
              const selectedCourses = mappedCourses.filter(course => 
                courseIdsFromFormData.includes(course.key)
              );
              
               setSelectedCourses(selectedCourses);
              form.setValue('course_id', selectedCourses, { shouldDirty: false, shouldValidate: false });
            }
          }
        } else {
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
          
           setSemesters(mappedSemesters);
          
          // Get saved semester IDs from directly from formData
          const semesterIdsFromFormData = formData?.semester_id || [];
           
          if (Array.isArray(semesterIdsFromFormData) && semesterIdsFromFormData.length > 0) {
            // If they're already objects with key/name, use them directly
            if (typeof semesterIdsFromFormData[0] === 'object' && semesterIdsFromFormData[0].key) {
               setSelectedSemesters(semesterIdsFromFormData);
              form.setValue('semester_id', semesterIdsFromFormData);
            } 
            // If they're strings (IDs), map them to objects
            else {
              const selectedSemesters = mappedSemesters.filter(semester => 
                semesterIdsFromFormData.includes(semester.key)
              );
              
               setSelectedSemesters(selectedSemesters);
              form.setValue('semester_id', selectedSemesters, { shouldDirty: false, shouldValidate: false });
            }
          }
        } else {
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
        
         
        if (response.data?.status && response.data?.data?.Subject && Array.isArray(response.data.data.Subject)) {
          // Map the subject data
          const mappedSubjects = response.data.data.Subject.map((subject: { 
            id: number, 
            subject_name: string,
            subject_code: string
          }) => ({
            key: String(subject.id),
            name: subject.subject_name || subject.subject_code || 'Unnamed Subject'
          }));
          
           setSubjects(mappedSubjects);
          
          // Check for original subject_id values to select
          const originalSubjectIds = sessionStorage.getItem('original_subject_ids');
          if (originalSubjectIds) {
            try {
              const subjectIds = JSON.parse(originalSubjectIds);
              
              // Match ids with the subject objects
              let matchedSubjects: {key: string, name: string}[] = [];
              
              if (Array.isArray(subjectIds)) {
                // If the IDs are stored directly in the array
                matchedSubjects = mappedSubjects.filter(subject => 
                  subjectIds.includes(subject.key) || subjectIds.includes(Number(subject.key))
                );
              }
              
               setSelectedSubjects(matchedSubjects);
              form.setValue('subject_id', matchedSubjects);
            } catch (e) {
              console.error('Error parsing stored subject IDs:', e);
            }
          }
        } else {
         }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get('/api/all_academic_years', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
         
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
          
           setAcademicYears(mappedAcademicYears);
        } else {
         }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    
    fetchCourses();
    fetchSemesters();
    fetchSubjects();
    fetchAcademicYears();
  }, [token, form, formData]);

  // Custom tag renderer for MultipleSelect
  const customTag = (item: {key: string, name: string}) => {
    return (
      <span className="text-nowrap">
        {item.name}
      </span>
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 5 images total (existing + new)
      const totalAllowed = 5 - existingImages.length;
      const newFiles = files.slice(0, totalAllowed);
      setSelectedImages([...selectedImages, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewUrls(prevUrls => {
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId));
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  async function onSubmit(data: ProfileFormValues) {
    data.name = data.staff_name;
    try {
      const formData = new FormData();
      
      // Explicitly append all form fields except images, course_id, and semester_id
      Object.keys(data).forEach(key => {
        if (key !== 'images' && key !== 'course_id' && key !== 'semester_id' && key !== 'subject_id') {
          const value = data[key];
          // Convert all values to string and handle undefined/null
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });
      
      // Handle course_id separately to extract just the IDs
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
       } else {
        // If no courses selected, send an empty array
        formData.append('course_id', JSON.stringify([]));
      }
      
      // Handle semester_id separately to extract just the IDs (similar to course_id)
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
       } else {
        // If no semesters selected, send an empty array
        formData.append('semester_id', JSON.stringify([]));
      }
      
      // Handle subject_id separately to extract just the IDs (similar to course_id and semester_id)
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
       } else {
        // If no subjects selected, send an empty array
        formData.append('subject_id', JSON.stringify([]));
      }
      
      // Ensure role is included in the form data
      if (data.role) {
        formData.set('role', data.role);
      }

      // Append each selected image to the FormData
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Add flag to delete existing images if requested
      formData.append('delete_existing_images', deleteExisting.toString());
      
      // Send the list of image IDs to delete
      if (deletedImageIds.length > 0 && !deleteExisting) {
        formData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      }

      await axios.post(`/api/staff/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff Updated Successfully");
      navigate({ to: "/staff" });
    } catch (error: any) {
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
        {" "}
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
                      <FormLabel>Name</FormLabel>
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
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
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
                      <FormLabel>Mobile</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
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
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role">
                              {field.value ? field.value.charAt(0).toUpperCase() + field.value.slice(1) : ''}
                            </SelectValue>
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

                 <FormField
                  control={form.control}
                  name="academic_years_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Academic Year..." />
                          </SelectTrigger>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               
                {isTeachingStaff && (
                  
                  <div className="flex gap-2">
                    
                    
                    <FormField
                      control={form.control}
                      name="course_id"
                      render={({ field }) => {
                        
                        
                        return (
                          <FormItem className="space-y-3">
                            <FormLabel>Courses</FormLabel>
                            <FormControl>
                              <CourseSelect
                                tags={courses}
                                onChange={(selectedItems: {key: string, name: string}[]) => {
                                  field.onChange(selectedItems);
                                  setSelectedCourses(selectedItems);
                                 }}
                                defaultValue={selectedCourses.length > 0 ? selectedCourses : (field.value || [])}
                                placeholder="Select courses"
                                customTag={customTag}
                                emptyIndicator={
                                  <p className="text-center text-muted-foreground py-6 text-sm">
                                    No courses available.
                                  </p>
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <FormField
                      control={form.control}
                      name="semester_id"
                      render={({ field }) => {
                          
                        return (
                          <FormItem className="space-y-3">
                            <FormLabel>Semesters</FormLabel>
                            <FormControl>
                              <SemesterSelect
                                tags={semesters}
                                onChange={(selectedItems: {key: string, name: string}[]) => {
                                  field.onChange(selectedItems);
                                  setSelectedSemesters(selectedItems);
                                 }}
                                defaultValue={selectedSemesters.length > 0 ? selectedSemesters : (field.value || [])}
                                placeholder="Select semesters"
                                customTag={customTag}
                                emptyIndicator={
                                  <p className="text-center text-muted-foreground py-6 text-sm">
                                    No semesters available.
                                  </p>
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject_id"
                      render={({ field }) => {
                          
                        return (
                          <FormItem className="space-y-3">
                            <FormLabel>Subjects</FormLabel>
                            <FormControl>
                              <SubjectSelect
                                tags={subjects}
                                onChange={(selectedItems: {key: string, name: string}[]) => {
                                  field.onChange(selectedItems);
                                  setSelectedSubjects(selectedItems);
                                 }}
                                defaultValue={selectedSubjects.length > 0 ? selectedSubjects : (field.value || [])}
                                placeholder="Select subjects"
                                customTag={customTag}
                                emptyIndicator={
                                  <p className="text-center text-muted-foreground py-6 text-sm">
                                    No subjects available.
                                  </p>
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />  
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Add this before the Profile Information Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Staff Documents Images</CardTitle>
              <CardDescription>Upload up to 5 images (JPEG, PNG, JPG - Max 2MB each)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleImageChange}
                  disabled={existingImages.length + selectedImages.length >= 5}
                />

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Existing Images</h4>
                    {existingImages.map((img) => {
                       return (
                      <div key={img.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <a 
                          href={`/api/staff-file/${img.image_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {img.image_path || `Image ${img.id}`}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}

                {/* New Images */}
                {selectedImages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">New Images</h4>
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
                          onClick={() => removeNewImage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="w-full ">
            <CardHeader>
              <CardTitle>Staff Login Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                      <FormLabel>Password</FormLabel>
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
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/staff" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Staff
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/staff/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/staff/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data.Staff);
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
        <div className="flex justify-between">
          <CardTitle>Staff Master</CardTitle>
          {formData?.institute_name && (
            <span className="text-muted-foreground">
              {formData.institute_name}
            </span>
          )}
        </div>
        <CardDescription>Edit/Update the Staff</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
    </Card>
  );
}
