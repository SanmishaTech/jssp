import { useEffect } from "react";
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

export default function AddCashierDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
}: AddCashierDialogProps) {
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
    reset();
    onOpen(false);
  };

  async function onSubmit(data: ProfileFormValues) {
    data.userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
    try {
      await axios.post("/api/cashiers", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Cashier Created Successfully");
      onClose();
      fetchData();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, msgs]) => {
            const message = Array.isArray(msgs) ? msgs[0] : msgs;
            setError(field as any, { message });
            toast.error(message);
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
            <ModalHeader>Add Cashier</ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="cheque"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Cheque <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Cheque..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="cash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Cash <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Cash..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="upi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            UPI <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="UPI..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="total_fees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Fees</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} disabled />
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
              <Button color="primary" onPress={handleSubmit(onSubmit)}>
                Add Cashier
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
