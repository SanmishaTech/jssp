import React from "react";

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
import { Textarea } from "@/Components/ui/textarea";

const profileFormSchema = z.object({
  exam_title: z.string().trim().nonempty("Exam Title is Required"),
  from_date: z.string().trim().nonempty("From Date is Required"),
  to_date: z.string().trim().nonempty("To Date is Required"),
  description: z.string().trim().nonempty("Description is Required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditRoomDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  roomId: string;
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

export default function EditRoomDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
  roomId,
}: EditRoomDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {};
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const fromDate = form.watch("from_date");

  const onClose = () => {
    onOpen(false);
    form.reset();
  };

  const token = localStorage.getItem("token");

  // Fetch room data when dialog opens
  React.useEffect(() => {
    if (isOpen && roomId) {
      const fetchRoomData = async () => {
        try {
          const response = await axios.get(`/api/exams/${roomId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const roomData = response.data.data.Exam;
          form.reset(roomData);
        } catch (error) {
          console.error("Error fetching room:", error);
          toast.error("Failed to load room data");
          onClose();
        }
      };
      fetchRoomData();
    }
  }, [isOpen, roomId, form, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const formattedData = {
        exam_title: data.exam_title,
        from_date: data.from_date,
        to_date: data.to_date,
        description: data.description,
      };

      await axios.patch(`/api/exams/${roomId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Exam Updated Successfully");
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
            <ModalHeader className="flex flex-col gap-1">Edit Exam</ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="exam_title"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Exam Title
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Exam Title..." {...field} />
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
                            <Input type="date" placeholder="From Date..." {...field} />
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
                            <Input
                              type="date"
                              placeholder="To Date..."
                              {...field}
                              min={fromDate}
                              disabled={!fromDate}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                  </div>
                  <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Description
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea placeholder="Description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </form>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Update Exam
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
