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
  title: z.string().trim().nonempty("Title is Required"),
  description: z.string().trim().nonempty("Description is Required"),
  from_date: z.any().optional(),
  to_date: z.any().optional(),
  userId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditCourseDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  courseId: string;
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

export default function EditCourseDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
  courseId,
}: EditCourseDialogProps) {
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

  // Fetch course data when dialog opens
  React.useEffect(() => {
    if (isOpen && courseId) {
      const fetchCourseData = async () => {
        try {
          const response = await axios.get(`/api/holiday/${courseId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const courseData = response.data.data.Holiday;
          form.reset(courseData);
        } catch (error) {
          console.error("Error fetching holiday:", error);
          toast.error("Failed to load holiday data");
          onClose();
        }
      };
      fetchCourseData();
    }
  }, [isOpen, courseId, form, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axios.put(`/api/holiday/${courseId}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Holiday Updated Successfully");
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
              Edit Course
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <FormField
                                     control={form.control}
                                     name="title"
                                     render={({ field }: FormFieldProps) => (
                                       <FormItem>
                                         <FormLabel>
                                           Title
                                           <span className="text-red-500">*</span>
                                         </FormLabel>
                                         <FormControl>
                                           <Input placeholder="Title..." {...field} />
                                         </FormControl>
                                         <FormMessage />
                                       </FormItem>
                                     )}
                                   />
                                   <FormField
                                     control={form.control}
                                     name="description"
                                     render={({ field }: FormFieldProps) => (
                                       <FormItem>
                                         <FormLabel>
                                           Description
                                           <span className="text-red-500">*</span>
                                         </FormLabel>
                                         <FormControl>
                                           <Input placeholder="Description..." {...field} />
                                         </FormControl>
                                         <FormMessage />
                                       </FormItem>
                                     )}
                                   />
                                     <FormField
                                       control={form.control}
                                       name="from_date"
                                       render={({ field }: FormFieldProps) => (
                                         <FormItem>
                                           <FormLabel>
                                             From Date
                                             <span className="text-red-500">*</span>
                                           </FormLabel>
                                           <FormControl>
                                             <Input type="date" {...field} />
                                           </FormControl>
                                           <FormMessage />
                                         </FormItem>
                                       )}
                                     />
                                     <FormField
                                       control={form.control}
                                       name="to_date"
                                       render={({ field }: FormFieldProps) => (
                                         <FormItem>
                                           <FormLabel>
                                             To Date
                                             <span className="text-red-500">*</span>
                                           </FormLabel>
                                           <FormControl>
                                             <Input type="date" {...field} />
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
                Update Holiday
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
