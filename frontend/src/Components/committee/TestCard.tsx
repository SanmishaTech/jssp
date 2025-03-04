import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
import { X, ChevronLeft, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

// Schema for committee form with staff array
const committeeSchema = z.object({
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

type CommitteeFormValues = z.infer<typeof committeeSchema>;

interface StaffOption {
  value: string;
  label: string;
}

// Popover component to select a staff option
function StaffIdPopover({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: StaffOption[];
}) {
  const [open, setOpen] = React.useState(false);
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

export default function CommitteeForm() {
  const navigate = useNavigate();
  const form = useForm<CommitteeFormValues>({
    resolver: zodResolver(committeeSchema),
    defaultValues: {
      commitee_name: "",
      staff: [{ staff_id: "", designation: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "staff",
  });

  // Watch the current staff array to determine selected staff IDs
  const watchedStaff = form.watch("staff");

  // State to hold fetched staff options
  const [staffOptions, setStaffOptions] = React.useState<StaffOption[]>([]);

  // Fetch staff from the API when the component mounts
  React.useEffect(() => {
    async function fetchStaff() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/all_staff", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // Debug: log the response to verify its structure
        console.log("Staff API response:", response.data.data.Staff);
        // Adjust this line based on your actual API response structure:
        const fetchedStaff =
          response.data.data?.Staff || response.data.Staff || [];
        const options = fetchedStaff.map((staff: any) => ({
          value: staff.id.toString(),
          // Use staff name or designation as needed
          label: staff.staff_name || staff.name,
        }));
        setStaffOptions(options);
      } catch (error) {
        toast.error("Failed to fetch staff");
      }
    }
    fetchStaff();
  }, []);

  async function onSubmit(data: CommitteeFormValues) {
    try {
      const token = localStorage.getItem("token");

      await axios.post("/api/committee", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Committee created successfully");
      window.history.back();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { errors, message } = error.response.data; // Extract validation errors

        if (errors) {
          // Loop through backend validation errors and set them in the form
          Object.keys(errors).forEach((key) => {
            form.setError(key as keyof CommitteeFormValues, {
              type: "server",
              message: errors[key][0], // First error message from array
            });

            // Show each validation error as a separate toast notification
            toast.error(errors[key][0]);
          });
        } else {
          // If no specific validation errors, show a generic message
          toast.error(message || "Error creating committee");
        }
      } else {
        toast.error("Error creating committee");
      }
    }
  }

  return (
    <div className="mx-auto p-6">
      <Button
        onClick={() => window.history.back()}
        variant="ghost"
        type="button"
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>
      <Card className="bg-accent/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Add Committee</CardTitle>
          <CardDescription>
            Enter a committee name and add staff members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Committee Name Input */}
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

              {/* Staff Table */}
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

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button onClick={() => window.history.back()} type="button">
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
