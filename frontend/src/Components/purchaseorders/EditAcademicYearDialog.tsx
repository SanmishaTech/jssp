import React, { useState, useEffect, useCallback } from "react";

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
} from "../../Components/ui/form";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import MultipleSelector, { Option } from "../../Components/ui/multiselect";

const profileFormSchema = z.object({
  vendor_id: z.any().optional(),
  asset_master_id: z.string().trim().nonempty("Asset Type is Required"),
  asset_category_ids: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, "At least one Asset Category is Required"),
  quantity: z.any().optional(),
  price: z.any().optional(),
  description: z.string().optional(),
 });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditAcademicYearDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
  academicYearId: string;
}

// No longer needed as we're using a select dropdown for asset type

interface ServiceRequiredFieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement> | boolean) => void;
    onBlur: () => void;
    value: boolean;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
}

// Format function removed as it's no longer needed

export default function EditAcademicYearDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
  academicYearId,
}: EditAcademicYearDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {
    asset_category_ids: [],
    vendor_id: '',
    asset_master_id: '',
    quantity: '',
    price: '',
    description: '',
  };
  
  const [assetCategories, setAssetCategories] = useState<Option[]>([]);
  const [vendors, setVendors] = useState<{ id: string | number; name: string }[]>([]);
  const [assets, setAssets] = useState<{ id: string | number; name: string }[]>([]);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onClose = useCallback(() => {
    onOpen(false);
    form.reset();
  }, [onOpen, form]);

  const token = localStorage.getItem("token");

  // No longer needed for this component

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
      
      // Fetch vendors
      axios.get("/api/vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.data && response.data.data.Vendor) {
          setVendors(response.data.data.Vendor);
        } else {
          console.error('Vendors not found in response:', response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching vendors:", error);
        toast.error("Failed to load vendors");
      });
      
      // Fetch assets
      axios.get("/api/assetmasters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.data && response.data.data.AssetMaster) {
          setAssets(response.data.data.AssetMaster);
        } else {
          console.error('Assets not found in response:', response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching assets:", error);
        toast.error("Failed to load assets");
      });
    }
  }, [isOpen, token]);
  
  // Fetch purchase order data when dialog opens
  useEffect(() => {
    if (isOpen && academicYearId) {
      const fetchAcademicYearData = async () => {
        try {
          // Change endpoint to fetch purchase order data
          const response = await axios.get(`/api/purchaseorders/${academicYearId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          console.log('API Response for Purchase Order:', response.data);
          
          if (response.data && response.data.data && response.data.data.PurchaseOrder) {
            const purchaseOrderData = response.data.data.PurchaseOrder;
            
            // Format asset_category_ids to ensure it's an array of Option objects
            let categoryIds = purchaseOrderData.asset_category_ids;
            if (typeof categoryIds === 'string') {
              try {
                categoryIds = JSON.parse(categoryIds);
              } catch {
                // If parsing fails, use empty array
                categoryIds = [];
              }
            }
            
            // Ensure category IDs are in the correct format for the MultipleSelector
            if (Array.isArray(categoryIds)) {
              // Map to ensure each item has value and label properties
              purchaseOrderData.asset_category_ids = categoryIds.map(item => {
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
              purchaseOrderData.asset_category_ids = [];
            }
            
            // Format the data for form
            const formattedData = {
              vendor_id: purchaseOrderData.vendor_id?.toString() || '',
              asset_master_id: purchaseOrderData.asset_master_id?.toString() || '',
              asset_category_ids: purchaseOrderData.asset_category_ids || [],
              quantity: purchaseOrderData.quantity?.toString() || '',
              price: purchaseOrderData.price?.toString() || '',
              description: purchaseOrderData.description?.toString() || '',
             };
            
            console.log('Formatted data for form:', formattedData);
            form.reset(formattedData);
          } else {
            console.error('Unexpected API response structure:', response.data);
            toast.error("Invalid data format received from server");
          }
        } catch (error) {
          console.error("Error fetching purchase order:", error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            toast.error(error.response?.data?.message || "Failed to load purchase order data");
          } else {
            toast.error("An unexpected error occurred");
          }
          
          onClose();
        }
      };
      fetchAcademicYearData();
    }
  }, [isOpen, academicYearId, form, token, onClose, assetCategories]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Ensure data is properly formatted before submission
      const formattedData = {
        asset_master_id: data.asset_master_id,
        asset_category_ids: Array.isArray(data.asset_category_ids) ? data.asset_category_ids : [],
        vendor_id: data.vendor_id,
        quantity: data.quantity,
        price: data.price,
        description: data.description,
       };
      
      console.log('Submitting data:', formattedData);

      await axios.patch(`/api/purchaseorders/${academicYearId}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Purchase Order Updated Successfully");
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
              Edit Purchase Order
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    {/* Vendor Field - Full Width */}
                    <FormField
                      control={form.control}
                      name="vendor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Vendor
                          </FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={field.value as string}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            >
                              <option value="">Select Vendor</option>
                              {vendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.vendor_name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Asset Type and Asset Categories Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="asset_master_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Asset Type
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={field.value as string}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              >
                                <option value="">Select Asset Type</option>
                                {assets.map((asset) => (
                                  <option key={asset.id} value={asset.id}>
                                    {asset.asset_type}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                    </div>
                    
                    {/* Quantity and Price Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Quantity..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <FormField
                     control={form.control}
                     name="price"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Price</FormLabel>
                         <FormControl>
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                             <Input
                               type="number"
                               placeholder="Enter Price..."
                               {...field}
                               onKeyDown={(e) => {
                                 // Disallow "e", "+", "-" characters
                                 if (["e", "E", "+", "-"].includes(e.key)) {
                                   e.preventDefault();
                                 }
                               }}
                               className="pl-7"
                             />
                           </div>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                    </div>
                      <FormField
                                          control={form.control}
                                          name="description" 
                                          render={({ field }) => {
                                            const maxLength = 255;
                                            return (
                                              <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                  <div className="relative">
                                                    <Textarea
                                                      className="min-h-[100px] resize-none overflow-auto pr-10"
                                                      placeholder="Enter Description..."
                                                      maxLength={maxLength}
                                                      {...field}
                                                    />
                                                    <div className="absolute bottom-2 right-3 text-sm text-muted-foreground">
                                                      {field.value?.length || 0}/{maxLength} characters
                                                    </div>
                                                  </div>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            );
                                          }}
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
                Update Purchase Order
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
