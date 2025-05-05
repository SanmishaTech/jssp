import React, { useEffect, useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { ChevronsUpDown, Check } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const profileFormSchema = z.object({
  course_id: z.string().or(z.number()).transform(val => String(val)).refine(val => val.length > 0, {
    message: "Course is required"
  }),
  academic_years_id: z.string().or(z.number()).transform(val => String(val)).refine(val => val.length > 0, {
    message: "Academic Year is required"
  }),
  students_applied_for_scholarship: z.string().transform(Number),
  approved_from_university: z.string().transform(Number),
  first_installment_date: z.string(),
  first_installment_student: z.string(),
  first_installment_amount: z.string().transform(Number),
  second_installment_date: z.string(),
  second_installment_student: z.string(),
  second_installment_amount: z.string().transform(Number),
  third_installment_date: z.string(),
  third_installment_student: z.string(),
  third_installment_amount: z.string().transform(Number),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditScholarshipDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  scholarshipId: string;
}

interface FormFieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    value: string;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
}

// Define Course interface for type safety
interface Course {
  id: number | string;
  medium_title: string;
  [key: string]: any;
}

// Define AcademicYear interface for type safety
interface AcademicYear {
  id: number | string;
  academic_year: string;
  institute_id: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// Helper function to combine classnames (for simpler implementation)
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EditScholarshipDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
  scholarshipId,
}: EditScholarshipDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {
    course_id: "",
    academic_years_id: "",
  };
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onClose = () => {
    onOpen(false);
    form.reset();
  };

  const token = localStorage.getItem("token");

  // State for courses
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(false);
  
  // State for academic years
  const [academicYears, setAcademicYears] = React.useState<AcademicYear[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = React.useState(false);

  // Fetch courses from API
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
  
  // Fetch academic years from API
  React.useEffect(() => {
    setLoadingAcademicYears(true);
    axios
      .get("/api/all_academic_years", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const academicYearsData = response.data.data.AcademicYears || [];
        setAcademicYears(academicYearsData);
      })
      .catch((error) => {
        console.error("Error fetching academic years:", error);
        toast.error("Failed to fetch academic years");
      })
      .finally(() => setLoadingAcademicYears(false));
  }, [token]);

  // Fetch scholarship data when dialog opens
  React.useEffect(() => {
    if (isOpen && scholarshipId) {
      const fetchScholarshipData = async () => {
        try {
          const response = await axios.get(
            `/api/scholarships/${scholarshipId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const scholarshipData = response.data.data.Scholarship;
          form.reset(scholarshipData);
        } catch (error) {
          console.error("Error fetching scholarship:", error);
          toast.error("Failed to load scholarship data");
          onClose();
        }
      };
      fetchScholarshipData();
    }
  }, [isOpen, scholarshipId, form, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const formattedData = {
        course_id: String(data.course_id),
        academic_years_id: String(data.academic_years_id),
        students_applied_for_scholarship: Number(
          data.students_applied_for_scholarship
        ),
        approved_from_university: Number(data.approved_from_university),
        first_installment_date: data.first_installment_date,
        first_installment_student: data.first_installment_student,
        first_installment_amount: Number(data.first_installment_amount),
        second_installment_date: data.second_installment_date,
        second_installment_student: data.second_installment_student,
        second_installment_amount: Number(data.second_installment_amount),
        third_installment_date: data.third_installment_date,
        third_installment_student: data.third_installment_student,
        third_installment_amount: Number(data.third_installment_amount),
      };

      await axios.patch(`/api/scholarships/${scholarshipId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Scholarship Updated Successfully");
      onClose();
      fetchData();
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

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <Modal size="2xl" backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Scholarship
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                  
                 {/* Academic Year selection field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Academic Year
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <select
                       {...form.register("academic_years_id")}
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     >
                       <option value="">Select Academic Year...</option>
                       {academicYears.map((academicYear) => (
                         <option
                           key={academicYear.id.toString()}
                           value={academicYear.id.toString()}
                         >
                           {academicYear.academic_year}
                         </option>
                       ))}
                     </select>
                   </div>
                   {form.formState.errors.academic_years_id && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.academic_years_id.message}
                     </p>
                   )}
                 </div>

                  {/* Course selection field */}
                  <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Course Title
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <select
                       {...form.register("course_id")}
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     >
                       <option value="">Select Course...</option>
                       {courses.map((course) => (
                         <option
                           key={course.id.toString()}
                           value={course.id.toString()}
                         >
                           {course.medium_title}
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

                 {/* Students Applied field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Students Applied for Scholarship
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("students_applied_for_scholarship")}
                       placeholder="Students Applied for Scholarship..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.students_applied_for_scholarship && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.students_applied_for_scholarship.message}
                     </p>
                   )}
                 </div>

                 {/* Approved from University field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Approved from University
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("approved_from_university")}
                       placeholder="Approved from University..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.approved_from_university && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.approved_from_university.message}
                     </p>
                   )}
                 </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                 {/* First Installment Date field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     First Installment Date
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("first_installment_date")}
                       type="date"
                       placeholder="First Installment Date..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.first_installment_date && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.first_installment_date.message}
                     </p>
                   )}
                 </div>

                 {/* First Installment Student field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     First Installment Student
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("first_installment_student")}
                       placeholder="First Installment Student..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.first_installment_student && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.first_installment_student.message}
                     </p>
                   )}
                 </div>

                 {/* First Installment Amount field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     First Installment Amount
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("first_installment_amount")}
                       placeholder="First Installment Amount..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.first_installment_amount && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.first_installment_amount.message}
                     </p>
                   )}
                 </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                 {/* Second Installment Date field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Second Installment Date
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("second_installment_date")}
                       type="date"
                       placeholder="Second Installment Date..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.second_installment_date && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.second_installment_date.message}
                     </p>
                   )}
                 </div>


                   {/* Second Installment Student field */}
                   <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Second Installment Amount
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("second_installment_student")}
                       placeholder="Second Installment Student..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.second_installment_student && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.second_installment_student.message}
                     </p>
                   )}
                 </div>

                 {/* Second Installment Amount field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Second Installment Amount
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("second_installment_amount")}
                       placeholder="Second Installment Amount..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.second_installment_amount && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.second_installment_amount.message}
                     </p>
                   )}
                 </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                 {/* Third Installment Date field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Third Installment Date
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("third_installment_date")}
                       type="date"
                       placeholder="Third Installment Date..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.third_installment_date && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.third_installment_date.message}
                     </p>
                   )}
                 </div>


                   {/* Third Installment Student field */}
                   <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Third Installment Student
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("third_installment_student")}
                       placeholder="Third Installment Student..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.third_installment_student && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.third_installment_student.message}
                     </p>
                   )}
                 </div>

                 {/* Third Installment Amount field */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium mb-1">
                     Third Installment Amount
                     <span className="text-red-500">*</span>
                   </label>
                   <div className="relative">
                     <input
                       {...form.register("third_installment_amount")}
                       placeholder="Third Installment Amount..."
                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                     />
                   </div>
                   {form.formState.errors.third_installment_amount && (
                     <p className="mt-1 text-sm text-red-500">
                       {form.formState.errors.third_installment_amount.message}
                     </p>
                   )}
                 </div>
                 </div>
             
                </form>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Update Scholarship
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
