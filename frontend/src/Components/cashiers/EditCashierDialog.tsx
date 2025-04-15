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
  total_fees: z.string().trim().nonempty("Total Fees is Required"),
  cheque: z.string().trim().nonempty("Cheque is Required"),
  cash: z.string().trim().nonempty("Cash is Required"),
  upi: z.string().trim().nonempty("Upi is Required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditCashierDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  cashierId: string;
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

export default function EditCashierDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
  cashierId,
}: EditCashierDialogProps) {
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

  // Fetch cashier data when dialog opens
  React.useEffect(() => {
    if (isOpen && cashierId) {
      const fetchCashierData = async () => {
        try {
          const response = await axios.get(`/api/cashiers/${cashierId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const cashierData = response.data.data.Cashier;
          form.reset(cashierData);
        } catch (error) {
          console.error("Error fetching cashier:", error);
          toast.error("Failed to load cashier data");
          onClose();
        }
      };
      fetchCashierData();
    }
  }, [isOpen, cashierId, form, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const formattedData = {
        total_fees: data.total_fees,
        cheque: data.cheque,
        cash: data.cash,
        upi: data.upi,
      };

      await axios.patch(`/api/cashiers/${cashierId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Cashier Updated Successfully");
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
              Edit Cashier
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
                      name="total_fees"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Total Fees
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Total Fees..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cheque"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Cheque
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Cheque..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cash"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Cash
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Cash..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="upi"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            UPI
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="UPI..." {...field} />
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
                Update Cashier
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
