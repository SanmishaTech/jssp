import React, { useState, useEffect } from "react";

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
import MultipleSelector, { Option } from "../../Components/ui/multiselect";

const profileFormSchema = z.object({
  asset_type: z.string().trim().nonempty("Asset Type is Required"),
  asset_category_ids: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, "At least one Asset Category is Required"),
  service_required: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditAcademicYearDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  academicYearId: string;
}

interface AssetTypeFieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    value: string;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
}

interface ServiceRequiredFieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement> | boolean) => void;
    onBlur: () => void;
    value: boolean;
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
  const defaultValues: Partial<ProfileFormValues> = {
    asset_category_ids: [],
  };
  
  const [assetCategories, setAssetCategories] = useState<Option[]>([]);
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

  // Fetch asset categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Fetch asset categories
      axios.get("/api/assetcategories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('API Response:', response.data);
        if (response.data.data && response.data.data.AssetCategories) {
          // Transform the data to match the Option interface
          const categoryOptions = response.data.data.AssetCategories.map((category: { id: number; category_name: string }) => ({
            value: category.id.toString(),
            label: category.category_name
          }));
          console.log('Mapped Category Options:', categoryOptions);
          setAssetCategories(categoryOptions);
        } else {
          console.error('AssetCategories not found in response:', response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching asset categories:", error);
        toast.error("Failed to load asset categories");
      });
    }
  }, [isOpen, token]);
  
  // Fetch academic year data when dialog opens
  useEffect(() => {
    if (isOpen && academicYearId) {
      const fetchAcademicYearData = async () => {
        try {
           const response = await axios.get(`/api/assetmasters/${academicYearId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
           
          if (response.data && response.data.data && response.data.data.AssetMaster) {
            const academicYearData = response.data.data.AssetMaster;
            
            // Format asset_category_ids to ensure it's an array of Option objects
            let categoryIds = academicYearData.asset_category_ids;
            if (typeof categoryIds === 'string') {
              try {
                categoryIds = JSON.parse(categoryIds);
              } catch (e) {
                categoryIds = [];
              }
            }
            
            // Ensure category IDs are in the correct format for the MultipleSelector
            if (Array.isArray(categoryIds)) {
              // Map to ensure each item has value and label properties
              academicYearData.asset_category_ids = categoryIds.map(item => {
                if (typeof item === 'object' && item !== null) {
                  return {
                    value: item.value || item.id?.toString() || '',
                    label: item.label || item.category_name || ''
                  };
                } else if (typeof item === 'string' || typeof item === 'number') {
                  // If we just have an ID, find the matching category for the label
                  const matchingCategory = assetCategories.find(c => c.value === item.toString());
                  return {
                    value: item.toString(),
                    label: matchingCategory?.label || item.toString()
                  };
                }
                return { value: '', label: '' };
              }).filter(item => item.value !== '');
            } else {
              academicYearData.asset_category_ids = [];
            }
            
            console.log('Formatted data for form:', academicYearData);
            form.reset(academicYearData);
          } else {
            console.error('Unexpected API response structure:', response.data);
            toast.error("Invalid data format received from server");
          }
        } catch (error) {
          console.error("Error fetching asset master:", error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            toast.error(error.response?.data?.message || "Failed to load asset master data");
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
      // Ensure asset_category_ids is properly formatted before submission
      const formattedData = {
        asset_type: data.asset_type,
        asset_category_ids: Array.isArray(data.asset_category_ids) ? data.asset_category_ids : [],
        service_required: data.service_required,
      };
      
      console.log('Submitting data:', formattedData);

      await axios.patch(`/api/assetmasters/${academicYearId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Asset Master Updated Successfully");
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
              Edit Asset Master
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="flex grid  gap-4">
                    <FormField
                      control={form.control}
                      name="asset_category_ids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Asset Categories
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <MultipleSelector
                              commandProps={{
                                label: "Select asset categories",
                              }}
                              value={Array.isArray(field.value) ? field.value : []}
                              onChange={field.onChange}
                              options={assetCategories}
                              defaultOptions={assetCategories}
                              placeholder="Select asset categories"
                              hideClearAllButton={false}
                              hidePlaceholderWhenSelected
                              emptyIndicator={<p className="text-center text-sm">No categories found</p>}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asset_type"
                      render={({ field }: AssetTypeFieldProps) => (
                                        <FormItem>
                                          <FormLabel>
                                            Asset Type
                                            <span className="text-red-500">*</span>
                                          </FormLabel>
                                          <FormControl>
                                         <Input {...field} placeholder="Asset Type" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                
                                    <FormField
                  control={form.control}
                  name="service_required"
                  render={({ field }: ServiceRequiredFieldProps) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="service_required"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            className="w-4 h-4"
                          />
                          <FormLabel htmlFor="service_required" className="m-0">
                            Service Required 
                          </FormLabel>
                        </div>
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
                Update Asset Master
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
