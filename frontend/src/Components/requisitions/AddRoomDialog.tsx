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
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../Components/ui/form";
import { Input } from "../../Components/ui/input";
// No longer using shadcn UI Select components

const profileFormSchema = z.object({
  asset_master_id: z.string().trim().nonempty("Asset Name is Required"),
 description: z.string().trim().nonempty("Description is Required"),
  userId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddRoomDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque"; // Kept for backward compatibility
  fetchData: () => void;
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

export default function AddRoomDialog({
  isOpen,
  onOpen,
  backdrop = "blur", // Keeping parameter for backward compatibility
  fetchData,
}: AddRoomDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {};
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const [assetMasters, setAssetMasters] = useState<{ id: string; asset_type: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch asset masters when dialog opens
      const token = localStorage.getItem("token");
      axios.get("/api/all_assetmasters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.data && response.data.data.AssetMaster) {
          setAssetMasters(response.data.data.AssetMaster);
        }
      })
      .catch((error) => {
        console.error("Error fetching asset masters:", error);
        toast.error("Failed to load asset masters");
      });
    }
  }, [isOpen]);

  const onClose = () => {
    onOpen(false);
    form.reset();
  };

  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    try {
      await axios.post(`/api/requisitions`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Requisition Created Successfully");
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
              Add New Requisition
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
                      name="asset_master_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Asset Master
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <select
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Select an asset...</option>
                              {assetMasters.map((asset) => (
                                <option
                                  key={asset.id.toString()}
                                  value={asset.id.toString()}
                                >
                                  {asset.asset_type}
                                </option>
                              ))}
                            </select>
                          </div>
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
                  </div>
                </form>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Add Requisition
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
