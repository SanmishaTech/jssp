import React, { useEffect } from "react";

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

const profileFormSchema = z
  .object({
    total_fees: z.string().trim().nonempty("Total Fees is required"),
    cheque: z.string().optional(),
    cash: z.string().optional(),
    upi: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine(
    (data) => !!(data.cheque?.trim() || data.cash?.trim() || data.upi?.trim()),
    {
      message: "At least one of Cheque, Cash, or UPI must be filled",
      path: ["cheque"], // You can choose to show error on any one field, or duplicate for others
    }
  );
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
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { total_fees: "", cheque: "", cash: "", upi: "" },
    mode: "onChange",
  });

  const { watch, setValue, control, reset, handleSubmit, setError } = form;
  const chequeVal = watch("cheque");
  const cashVal = watch("cash");
  const upiVal = watch("upi");

  useEffect(() => {
    if (!chequeVal && !cashVal && !upiVal) {
      setValue("total_fees", "", { shouldValidate: true });
      return;
    }
    const sum =
      (Number(chequeVal) || 0) + (Number(cashVal) || 0) + (Number(upiVal) || 0);
    setValue("total_fees", sum.toString(), { shouldValidate: true });
  }, [chequeVal, cashVal, upiVal, setValue]);

  const onClose = () => {
    onOpen(false);
    reset();
  };

  const token = localStorage.getItem("token");

  // Fetch cashier data when dialog opens
  useEffect(() => {
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
          reset({
            cheque: cashierData.cheque ?? "",
            cash: cashierData.cash ?? "",
            upi: cashierData.upi ?? "",
            total_fees: cashierData.total_fees ?? "",
          });
        } catch (error) {
          console.error("Error fetching cashier:", error);
          toast.error("Failed to load cashier data");
          onClose();
        }
      };
      fetchCashierData();
    }
  }, [isOpen, cashierId, reset, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axios.patch(`/api/cashiers/${cashierId}`, data, {
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
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            form.setError(field as keyof ProfileFormValues, {
              message: Array.isArray(messages) ? messages[0] : messages,
            });
            toast.error(Array.isArray(messages) ? messages[0] : messages);
          });
        } else {
          toast.error(errorData.message || "An error occurred");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="total_fees"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Total Fees
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled
                              {...field}
                              placeholder="Total Fees..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
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
                      control={control}
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
                      control={control}
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
              <Button color="primary" onPress={() => handleSubmit(onSubmit)()}>
                Update Cashier
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
