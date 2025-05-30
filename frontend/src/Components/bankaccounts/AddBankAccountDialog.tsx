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
  name: z.string().trim().nonempty("Account Holder Name is required"),
  bank_name: z.string().trim().nonempty("Bank Name is required"),
  account_number: z.string().trim().nonempty("Account Number is required"),
  ifsc_code: z.string().trim().nonempty("IFSC Code is required"),
  branch: z.string().trim().nonempty("Branch is required"),
  address: z.string().trim().nonempty("Address is required"),
  email: z.string().email("Invalid email").nonempty("Email is required"),
  phone: z.string().trim().nonempty("Phone is required"),
  userId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddAdmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddAdmissionDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddAdmissionDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {};
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    try {
      await axios.post(`/api/bankaccounts`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Bank Account Created Successfully");
      handleClose();
      onSuccess();
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
    <Modal size="2xl" backdrop="blur" isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Bank Account
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
                      name="name"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Account Holder Name
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Account Holder Name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Bank Name
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Bank Name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Account Number
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Account Number..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ifsc_code"
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            IFSC Code
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="IFSC Code..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }: FormFieldProps) => (
                      <FormItem>
                        <FormLabel>
                          Branch Address
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Address..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }: FormFieldProps) => (
                      <FormItem>
                        <FormLabel>
                          Branch
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Branch..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <div className="grid grid-cols-2 gap-4">
        <FormField
    control={form.control}
    name="email"
    render={({ field }: FormFieldProps) => (
      <FormItem>
        <FormLabel>
        Contact Email <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input placeholder="Email..." {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="phone"
    render={({ field }: FormFieldProps) => (
      <FormItem>
        <FormLabel>
        Contact Phone <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input placeholder="Phone..." {...field} />
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
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Add Bank Account
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
