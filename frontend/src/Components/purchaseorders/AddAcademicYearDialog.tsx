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
import {Checkbox} from "@heroui/checkbox";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
// Input component is used in MultipleSelector, keeping the import
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
  status: z.any().optional(),
  userId: z.string().optional(),
  description: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddAcademicYearDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  fetchData: () => void;
}

// Interface for custom form field render props
interface FormFieldRenderProps {
  field: {
    onChange: (value: unknown) => void;
    onBlur: () => void;
    value: unknown;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
  fieldState?: unknown;
  formState?: unknown;
}

// Academic year formatting is no longer used in this component

export default function AddAcademicYearDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
}: AddAcademicYearDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {
    asset_master_id: '',
    asset_category_ids: [],
    vendor_id: '',
    quantity: '',
    price: '',
    status: '',
    userId: '',
  };
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const [assetCategories, setAssetCategories] = useState<Option[]>([]);
  const [filteredAssetCategories, setFilteredAssetCategories] = useState<Option[]>([]);
  const [vendors, setVendors] = useState<{ id: string | number; name: string }[]>([]);
  const [assets, setAssets] = useState<{ id: string | number; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      
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
          setFilteredAssetCategories(categoryOptions); // Initialize with all categories
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
      axios.get("/api/all_assetmasters", {
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
  }, [isOpen]);
  
  // Watch for changes to asset_master_id and fetch related categories
  const watchedAssetMasterId = form.watch('asset_master_id');
  
  useEffect(() => {
    if (watchedAssetMasterId) {
      const token = localStorage.getItem("token");
      
      // Fetch categories for the selected asset
      axios.get(`/api/asset_categories_by_asset/${watchedAssetMasterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.data && response.data.data.AssetCategories) {
          // Transform the data to match the Option interface
          const assetCategoryOptions = response.data.data.AssetCategories.map((category: { id: number; category_name: string }) => ({
            value: category.id.toString(),
            label: category.category_name
          }));
          
          // Update the filtered categories
          setFilteredAssetCategories(assetCategoryOptions);
          
          // Clear current selection since it might not be valid for the new asset
          form.setValue('asset_category_ids', []);
        } else {
          // If no categories found for this asset, show empty list
          setFilteredAssetCategories([]);
          form.setValue('asset_category_ids', []);
        }
      })
      .catch((error) => {
        console.error("Error fetching asset categories for the selected asset:", error);
        toast.error("Failed to load categories for the selected asset");
        // On error, reset to all categories
        setFilteredAssetCategories(assetCategories);
      });
    } else {
      // If no asset is selected, show all categories
      setFilteredAssetCategories(assetCategories);
    }
  }, [watchedAssetMasterId, assetCategories, form]);

  const onClose = () => {
    onOpen(false);
    form.reset();
  };

  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");

  // No longer used, removing to fix lint warning

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    
    // Ensure asset_category_ids is properly formatted before submission as JSON string like in AssetMasterController
    const formattedData = {
      ...data,
      // Convert the array of objects to a format the backend expects
      asset_category_ids: Array.isArray(data.asset_category_ids) ? JSON.stringify(data.asset_category_ids) : JSON.stringify([])
    };
    
    try {
      await axios.post(`/api/purchaseorders`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Purchase Order Created Successfully");
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
              Add New Purchase Order
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Vendor
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...form.register("vendor_id")}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="">Select Vendor...</option>
                          {vendors.map((vendor) => (
                            <option
                              key={vendor.id.toString()}
                              value={vendor.id.toString()}
                            >
                              {vendor.vendor_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {form.formState.errors.vendor_id && (
                        <p className="mt-1 text-sm text-red-500">
                          {form.formState.errors.vendor_id.message?.toString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Asset
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            {...form.register("asset_master_id")}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            onChange={(e) => {
                              // Manually trigger form validation after selection
                              form.setValue('asset_master_id', e.target.value);
                              form.trigger('asset_master_id');
                            }}
                          >
                            <option value="">Select Asset...</option>
                            {assets.map((asset) => (
                              <option
                                key={asset.id.toString()}
                                value={asset.id.toString()}
                              >
                                {asset.asset_type}
                              </option>
                            ))}
                          </select>
                        </div>
                        {form.formState.errors.asset_master_id && (
                          <p className="mt-1 text-sm text-red-500">
                            {form.formState.errors.asset_master_id.message?.toString()}
                          </p>
                        )}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="asset_category_ids"
                        render={({ field }: FormFieldRenderProps) => (
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
                                options={filteredAssetCategories}
                                defaultOptions={filteredAssetCategories}
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
                            name="quantity"
                            render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
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
                              <Input placeholder="Enter Price..." {...field} />
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
                Add Purchase Order
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
