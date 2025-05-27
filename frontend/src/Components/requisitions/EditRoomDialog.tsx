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
  asset_master_id: z.string().trim().nonempty("Asset Name is Required"),
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

  const [assetMasters, setAssetMasters] = useState<{ id: string; asset_type: string }[]>([]);

  const onClose = () => {
    onOpen(false);
    form.reset();
  };

  const token = localStorage.getItem("token");

  // Fetch room data and asset masters when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Fetch asset masters
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
      
      // Fetch requisition data if roomId is provided
      if (roomId) {
        const fetchRoomData = async () => {
          try {
            const response = await axios.get(`/api/requisitions/${roomId}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            const roomData = response.data.data.Requisition;
            form.reset(roomData);
          } catch (error) {
            console.error("Error fetching room:", error);
            toast.error("Failed to load room data");
            onClose();
          }
        };
        fetchRoomData();
      }
    }
  }, [isOpen, roomId, form, token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const formattedData = {
        asset_master_id: data.asset_master_id,
        description: data.description,
      };

      await axios.patch(`/api/requisitions/${roomId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Room Updated Successfully");
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
            <ModalHeader className="flex flex-col gap-1">Edit Room</ModalHeader>
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
                      render={({ field }: FormFieldProps) => (
                        <FormItem>
                          <FormLabel>
                            Asset Master
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <select
                              value={field.value}
                              onChange={(e) => {
                                // Create a synthetic event object that matches what the form expects
                                const syntheticEvent = {
                                  target: { value: e.target.value },
                                  currentTarget: { value: e.target.value },
                                } as React.ChangeEvent<HTMLInputElement>;
                                field.onChange(syntheticEvent);
                              }}
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
                Update Room
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
