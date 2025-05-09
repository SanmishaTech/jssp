import React, { useState } from "react";

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";

const profileFormSchema = z.object({
  academic_year: z
    .string()
    .trim()
    .nonempty("Academic Year is Required")
    .regex(
      /^\d{4}-\d{2}$/,
      "Academic Year must be in format YYYY-YY (e.g., 2025-26)"
    ),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditAcademicYearDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  academicYearId: string;
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

const formatAcademicYear = (value: string) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // If we have 4 or more digits, automatically add the dash and next year's last two digits
  if (digits.length >= 4) {
    const firstYear = parseInt(digits.substring(0, 4));
    const nextYear = (firstYear + 1) % 100;
    const formattedNextYear = nextYear < 10 ? `0${nextYear}` : `${nextYear}`;
    return `${digits.substring(0, 4)}-${formattedNextYear}`;
  }
  
  // Otherwise just return the digits (up to 4)
  return digits.substring(0, 4);
};

export default function EditAcademicYearDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
  academicYearId,
}: EditAcademicYearDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {};
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

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const formatted = formatAcademicYear(e.target.value);
    field.onChange(formatted);
  };

  // Fetch academic year data when dialog opens
  React.useEffect(() => {
    if (isOpen && academicYearId) {
      const fetchAcademicYearData = async () => {
        try {
           const response = await axios.get(`/api/academic_years/${academicYearId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
           
          if (response.data && response.data.data && response.data.data.AcademicYears) {
            const academicYearData = response.data.data.AcademicYears;
            form.reset(academicYearData);
          } else {
            console.error('Unexpected API response structure:', response.data);
            toast.error("Invalid data format received from server");
          }
        } catch (error) {
          console.error("Error fetching academic year:", error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            toast.error(error.response?.data?.message || "Failed to load academic year data");
          } else {
            toast.error("An unexpected error occurred");
          }
          
          onClose();
        }
      };
      fetchAcademicYearData();
    }
  }, [isOpen, academicYearId, form, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const formattedData = {
        academic_year: data.academic_year, // Remove Number() conversion
      };

      await axios.patch(`/api/academic_years/${academicYearId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Academic Year Updated Successfully");
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
              Edit Academic Year
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <FormField
                      control={form.control}
                      name="academic_year"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Academic Year
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter year (e.g., 2025 will become 2025-26)" 
                              {...field} 
                              onChange={(e) => handleInputChange(e, field)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Update Academic Year
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
