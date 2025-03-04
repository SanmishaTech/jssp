import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, ChevronsUpDown, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";

// Define a type for staff options
interface StaffOption {
  value: string;
  label: string;
}

// Staff selection popover component
function StaffIdPopover({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: StaffOption[];
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedOption ? selectedOption.label : "Select Staff..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search staff..." className="h-9" />
          <CommandList>
            {options.length === 0 && (
              <CommandEmpty>No staff found.</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  {value === option.value && <Check className="ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Updated schema to match committee editing (name and staff members)
const profileFormSchema = z.object({
  commitee_name: z.string().trim().nonempty("Committee Name is required"),
  staff: z
    .array(
      z.object({
        staff_id: z.string().trim().nonempty("Staff ID is required"),
        designation: z.string().trim().nonempty("Designation is required"),
      })
    )
    .min(1, "At least one staff member is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileForm({ formData }: { formData: Partial<ProfileFormValues> }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const [loading, setLoading] = useState(false);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  // Watch the staff array to determine selected values
  const watchedStaff = form.watch("staff");

  const { id } = useParams({ from: "/committee/edit/$id" });
  const { reset, control } = form;

  // Reset form values when formData changes.
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axios.put(`/api/committee/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Committee Updated Successfully");
      navigate({ to: "/committee" });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const { errors, message } = error.response.data; // Extract errors

        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMessage = Array.isArray(messages)
              ? messages[0]
              : messages;

            // Set form validation error
            form.setError(field as keyof ProfileFormValues, {
              type: "server",
              message: errorMessage,
            });

            // Show toast notification for each error
            toast.error(errorMessage);
          });
        } else {
          toast.error(
            message || "An error occurred while updating the committee."
          );
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  }

  // Fetch staff options from the API (similar to the add form)
  useEffect(() => {
    async function fetchStaff() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/all_staff", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedStaff =
          response.data.data?.Staff || response.data.Staff || [];
        const options = fetchedStaff.map((staff: any) => ({
          value: staff.id.toString(),
          label: staff.staff_name || "Admin",
        }));
        setStaffOptions(options);
      } catch (error) {
        toast.error("Failed to fetch staff");
      }
    }
    fetchStaff();
  }, []);

  useEffect(() => {
    if (formData && Array.isArray(formData.staff)) {
      const normalizedData = {
        ...formData,
        staff: formData.staff.map((member) => ({
          ...member,
          staff_id: String(member.staff_id),
        })),
      };
      console.log("Normalized formData:", normalizedData);
      reset(normalizedData);
    } else {
      reset(formData);
    }
  }, [formData, reset]);

  // Use useFieldArray for staff members
  const { fields, append, remove } = useFieldArray({
    control,
    name: "staff",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-8">
        <Card className="max-w-full p-4">
          <CardHeader>
            <CardTitle>Edit Committee</CardTitle>
            <CardDescription>Edit/Update the Committee details</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="commitee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Committee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter committee name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Staff Members Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Staff Members</h3>
              <Table>
                <TableCaption>
                  Enter details for each staff member.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    // Get the list of selected staff IDs from all rows
                    const selectedStaffIds = watchedStaff.map(
                      (s) => s.staff_id
                    );
                    // Filter options: include the current row's value, but exclude others already selected
                    const filteredOptions = staffOptions.filter(
                      (option) =>
                        option.value === watchedStaff[index]?.staff_id ||
                        !selectedStaffIds.includes(option.value)
                    );
                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`staff.${index}.staff_id`}
                            render={({ field }) => (
                              <FormControl>
                                <StaffIdPopover
                                  value={field.value}
                                  onChange={field.onChange}
                                  options={filteredOptions}
                                />
                              </FormControl>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`staff.${index}.designation`}
                            render={({ field }) => (
                              <FormControl>
                                <Input placeholder="Designation" {...field} />
                              </FormControl>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => remove(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          append({ staff_id: "", designation: "" })
                        }
                      >
                        Add Staff Member
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end w-full gap-3">
          <Button onClick={() => navigate({ to: "/committee" })} type="button">
            Cancel
          </Button>
          <Button type="submit">Update Committee</Button>
        </div>
      </form>
    </Form>
  );
}

export default function EditCommitteePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/committee/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/committee/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // Assuming the API returns a single committee in "Committee"
        setFormData(response.data.data.Committee);
      } catch (error) {
        toast.error("Failed to fetch committee data");
      }
    };
    if (id) {
      fetchData();
    }
    return () => {
      setFormData({});
    };
  }, [id]);

  return (
    <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5" />
        Back
      </Button>
      <CardHeader>
        <CardTitle>Edit Committee</CardTitle>
        <CardDescription>Edit/Update the Committee</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ProfileForm formData={formData} />
        </div>
      </CardContent>
    </Card>
  );
}
