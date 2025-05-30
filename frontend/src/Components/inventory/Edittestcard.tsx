import React, { useState, useEffect } from "react";
import MultipleSelector, { Option } from "../../Components/ui/multiselect";
// import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter, // Unused
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  // FormDescription, // Unused
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
 
const profileFormSchema = z.object({
  asset_master_id: z.number().optional(), // Added and typed as number
  institute_id: z.string().trim().optional(),
  room_id: z.any().optional(),
  unit: z.string().optional(), // Added field for unit
  // asset: z.string().trim().nonempty("Asset is Required"), // Replaced by asset_master_id
  asset_category_ids: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, "At least one Asset Category is Required"),
  quantity: z.string().trim().nonempty("Quantity is Required"),
  purchase_price: z.string().trim().nonempty("Purchase Price is Required"),
  purchase_date: z.string().trim().nonempty("Purchase Date is Required"),
  status: z.string().trim().nonempty("Status is Required"),
  scraped_amount: z.any().optional(),
  scraped_quantity: z.any().optional(),
  remarks: z.string().trim().nonempty("Remarks is Required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.

function ProfileForm({ formData }: { formData: Partial<ProfileFormValues> }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Watch the status field to conditionally render the scraped_amount field
  const watchStatus = form.watch("status");
  const { id } = useParams({ from: "/inventory/edit/$id" });
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadingAssetMasters, setLoadingAssetMasters] = React.useState(false);
  const [assetMasters, setAssetMasters] = React.useState<any[]>([]);
  const [loadingAssetCategories, setLoadingAssetCategories] = React.useState(false);
  const [assetCategories, setAssetCategories] = React.useState<Option[]>([]);
  const apiToken = localStorage.getItem("token"); // Renamed to apiToken for clarity and to avoid conflict
  const role = localStorage.getItem("role");
  const navigate = useNavigate(); // Added for navigation within ProfileForm
  const isSuperAdmin = role === "superadmin";
  
  // Watch for changes to asset_master_id and update the unit accordingly
  React.useEffect(() => {
    const assetMasterId = form.watch("asset_master_id");
    if (assetMasterId) {
      const selectedAsset = assetMasters.find(am => am.id === assetMasterId);
      if (selectedAsset && selectedAsset.unit) {
        form.setValue("unit", selectedAsset.unit);
      } else {
        form.setValue("unit", "");
      }
    } else {
      form.setValue("unit", "");
    }
  }, [form.watch("asset_master_id"), assetMasters]);

  const { reset } = form;

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/all_institute", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((response) => {
        // Extract courses from the API response.
        const coursesData = response.data.data.Institutes || [];
        setCourses(coursesData);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      })
      .finally(() => setLoading(false));

    // Fetch rooms
    setLoadingRooms(true);
    axios
      .get("/api/rooms", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((response) => {
        const roomsData = response.data.data.Room || [];
        setRooms(roomsData);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to fetch rooms");
      })
      .finally(() => setLoadingRooms(false));

    // Fetch asset masters
    setLoadingAssetMasters(true);
    axios
      .get("/api/all_assetmasters", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((response) => {
        const assetMastersData = response.data.data.AssetMaster || [];
        setAssetMasters(assetMastersData);
      })
      .catch((_error) => {
        toast.error("Failed to fetch asset masters");
      })
      .finally(() => setLoadingAssetMasters(false));
      
    // Fetch asset categories
    setLoadingAssetCategories(true);
    axios
      .get("/api/assetcategories", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((response) => {
        console.log('Asset Categories API Response:', response.data);
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
      })
      .finally(() => setLoadingAssetCategories(false));
  }, [apiToken, reset, formData]); // Updated token dependency, kept reset and formData

  // Reset form values when formData changes
  useEffect(() => {
    // Ensure room_id is a string
    if (formData?.room_id !== undefined && formData?.room_id !== null) {
      formData.room_id = formData.room_id.toString();
    }

    // Ensure asset_master_id is a number
    if (formData?.asset_master_id !== undefined && formData?.asset_master_id !== null) {
      formData.asset_master_id = Number(formData.asset_master_id);
    }
    
    reset(formData);
  }, [formData, reset]);

  async function onSubmit(data: ProfileFormValues) {
    // Ensure asset_category_ids is properly formatted before submission
    const formattedData = {
      ...data,
      asset: data.asset_master_id, // Map asset_master_id to asset for backend compatibility
      asset_category_ids: Array.isArray(data.asset_category_ids) ? data.asset_category_ids : []
    };
    
    try {
      await axios.put(`/api/inventory/${id}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      });

      toast.success("Inventory Updated Successfully");
      navigate({ to: "/inventory" });
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        {" "}
        <div className="space-y-6">
          {/* Institute Information Section */}
          <Card className="max-w-full p-4">
             <CardHeader className="flex flex-row justify-between items-start">
                          <div>
                            <CardTitle>Asset Information</CardTitle>
                            <CardDescription>Provide the details of Asset.</CardDescription>
                          </div>
                          <div className="min-w-[300px] mt-1 ml-auto pl-[100px]">
                            <FormField
                              control={form.control}
                              name="purchase_date"
                              render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "purchase_date"> }) => (
                                <div className="flex items-center gap-2">
                                  <div className="min-w-[100px]">
                                    <FormLabel className="mb-0 mt-0">
                                      Purchase Date
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                  </div>
                                  <div className="flex-1">
                                    <FormControl>
                                      <Input
                                        type="date"
                                        max={new Date().toISOString().split("T")[0]} // Restrict future dates
                                        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </div>
                              )}
                            />
                          </div>
                        </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {isSuperAdmin && (
                  <FormField
                    control={form.control}
                    name="institute_id"
                    render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "institute_id"> }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mt-2">
                          Institute <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className=" justify-between"
                              >
                                {field.value
                                  ? courses.find(
                                      (course) =>
                                        course.id.toString() === field.value
                                    )?.institute_name || "Select Institute..."
                                  : "Select Institute..."}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className=" p-0">
                              <Command>
                                <CommandInput placeholder="Search course..." />
                                <CommandList>
                                  <CommandEmpty>
                                    {loading
                                      ? "Loading institute..."
                                      : "No institute found."}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {courses.map((course) => (
                                      <CommandItem
                                        key={course.id}
                                        value={course.id.toString()}
                                        onSelect={(currentValue: string) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        {course.institute_name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === course.id.toString()
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                                 control={form.control}
                                 name="room_id"
                                 render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "room_id"> }) => (
                                   <FormItem className="flex-1">
                                     <FormLabel className="mt-[10px]">
                                       Room Title <span className="text-red-500">*</span>
                                     </FormLabel>
                                     <FormControl>
                                       <Popover>
                                         <PopoverTrigger asChild>
                                           <Button
                                             variant="outline"
                                             role="combobox"
                                             className="w-full justify-between"
                                           >
                                             {field.value
                                               ? rooms.find(
                                                   (room) => room.id.toString() === (field.value?.toString() || '')
                                                 )?.room_name || "Select Room..."
                                               : "Select Room..."}
                                             <ChevronsUpDown className="opacity-50" />
                                           </Button>
                                         </PopoverTrigger>
                                         <PopoverContent className="w-[300px] p-0">
                                           <Command>
                                             <CommandInput placeholder="Search room..." />
                                             <CommandList>
                                               <CommandEmpty>
                                                 {loadingRooms
                                                   ? "Loading rooms..."
                                                   : "No room found."}
                                               </CommandEmpty>
                                               <CommandGroup>
                                                 {rooms.map((room) => (
                                                   <CommandItem
                                                     key={room.id}
                                                     value={room.id.toString()}
                                                     onSelect={(value: string) => {
                                                       // Ensure value is always a string and never empty
                                                       const stringValue = value.toString();
                                                       field.onChange(stringValue);
                                                     }}
                                                   >
                                                     {room.room_name}
                                                     <Check
                                                       className={cn(
                                                         "ml-auto",
                                                         field.value?.toString() === room.id.toString()
                                                           ? "opacity-100"
                                                           : "opacity-0"
                                                       )}
                                                     />
                                                   </CommandItem>
                                                 ))}
                                               </CommandGroup>
                                             </CommandList>
                                           </Command>
                                         </PopoverContent>
                                       </Popover>
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>
                                 )}
                               />

                <FormField
                  control={form.control}
                  name="asset_master_id" // Changed name from 'asset'
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "asset_master_id"> }) => {
                    const selectedAssetMaster = assetMasters.find(
                      (am) => am.id === field.value
                    );
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Asset Master
                          {/* Optional: Add span for asterisk if required */}
                          {/* <span className="text-red-500">*</span> */}
                        </FormLabel>
                        <FormControl>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? selectedAssetMaster?.asset_type || "Select Asset Master"
                                  : "Select Asset Master"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search asset master..." />
                                <CommandList>
                                  <CommandEmpty>
                                    {loadingAssetMasters
                                      ? "Loading asset masters..."
                                      : "No asset master found."}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {(() => {
                                      if (loadingAssetMasters) {
                                        return (
                                          <CommandItem disabled>
                                            Loading...
                                          </CommandItem>
                                        );
                                      }
                                      if (assetMasters.length === 0) {
                                        return (
                                          <CommandItem disabled>
                                            No asset masters available
                                          </CommandItem>
                                        );
                                      }
                                      return assetMasters.map((am) => (
                                        <CommandItem
                                          value={am.asset_type}
                                          key={am.id}
                                          onSelect={() => {
                                            form.setValue("asset_master_id", am.id, { shouldValidate: true });
                                            // Set the unit from the selected asset master
                                            if (am.unit) {
                                              form.setValue("unit", am.unit);
                                            }
                                            setOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              am.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {am.asset_type}
                                        </CommandItem>
                                      ));
                                    })()}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                
                {/* Unit Field - Read Only */}
                {form.watch("asset_master_id") && (
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "unit"> }) => (
                      <FormItem>
                        <FormLabel>
                          Unit
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Unit" 
                            {...field} 
                            readOnly 
                            disabled 
                            className="bg-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="asset_category_ids"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "asset_category_ids"> }) => (
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
                  name="quantity"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "quantity"> }) => (
                    <FormItem>
                      <FormLabel>
                        Quantity
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter Quantity..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_price"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "purchase_price"> }) => (
                    <FormItem>
                      <FormLabel>
                        Purchase Price
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Purchase Price..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "status"> }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Select Status" />
                                   </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                   <SelectItem value="Active Stock">Active stock</SelectItem>
                                   <SelectItem value="Inactive Stock">Inactive stock</SelectItem>
                                   <SelectItem value="Discarded">Discarded </SelectItem>
                                   <SelectItem value="Scraped">Scraped </SelectItem>
                                 </SelectContent>
                               </Select>
                               
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                         {watchStatus === "Scraped" && (
                           <>
                           <FormField
                             control={form.control}
                             name="scraped_amount"
                             render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "scraped_amount"> }) => (
                               <FormItem>
                                 <FormLabel>
                                   Scraped Amount
                                   <span className="text-red-500">*</span>
                                 </FormLabel>
                                 <FormControl>
                                   <Input placeholder="Enter Scraped Amount..." {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={form.control}
                             name="scraped_quantity"
                             render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "scraped_quantity"> }) => (
                               <FormItem>
                                 <FormLabel>
                                   Scraped Quantity
                                   <span className="text-red-500">*</span>
                                 </FormLabel>
                                 <FormControl>
                                   <Input placeholder="Enter Scraped Quantity..." {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           </>
                         )}
              </div>
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "remarks"> }) => (
                  <FormItem>
                    <FormLabel>
                      Remarks
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter Remarks..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/inventory" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Inventory
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  // const navigate = useNavigate(); // Removed as unused in this component
  const { id } = useParams({ from: "/inventory/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/inventory/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data);
    };
    if (id) {
      fetchData();
    }
    return () => {
      setFormData({});
    };
  }, [id]);
  return (
    <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4 ">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5 text-white" />
        Back
      </Button>

      <CardHeader>
        <CardTitle>Inventory Master</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  );
}
