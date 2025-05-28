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
  category_name: z
    .string()
    .trim()
    .nonempty("Category Name is Required"),
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

 

  // Fetch academic year data when dialog opens
  React.useEffect(() => {
    if (isOpen && academicYearId) {
      const fetchAcademicYearData = async () => {
        try {
           const response = await axios.get(`/api/assetcategories/${academicYearId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
           
          if (response.data && response.data.data && response.data.data.AssetCategories) {
            const academicYearData = response.data.data.AssetCategories;
            form.reset(academicYearData);
          } else {
            console.error('Unexpected API response structure:', response.data);
            toast.error("Invalid data format received from server");
          }
        } catch (error) {
          console.error("Error fetching asset category:", error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            toast.error(error.response?.data?.message || "Failed to load asset category data");
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
        category_name: data.category_name, // Remove Number() conversion
      };

      await axios.patch(`/api/assetcategories/${academicYearId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Asset Category Updated Successfully");
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
              Edit Asset Category
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
                      name="category_name"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Category Name
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Category Name" 
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
                Update Asset Category
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
