import React from "react";
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
  subject_id: z.string().trim().nonempty("Medium Code is Required"),
  division_id: z.string().trim().nonempty("Medium Title is Required"),
  student_name: z
    .string()
    .trim()
    .nonempty("First Installment Date is Required"),
  prn: z.string().trim().nonempty("First Installment Amount is Required"),
  abcId: z.string().trim().nonempty("First Installment Amount is Required"),

  userId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddScholarshipDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
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

export default function AddScholarshipDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  fetchData,
}: AddScholarshipDialogProps) {
  const defaultValues: Partial<ProfileFormValues> = {};
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

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
      await axios.post(`/api/scholarships`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Scholarship Created Successfully");
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
              Add New Scholarship
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className=" grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="student_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Student Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Student Name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            PRN <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="PRN..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="abcId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            ABC ID <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ABC ID..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Division Field */}
                    <FormField
                      control={form.control}
                      name="division_id"
                      render={({ field }) => {
                        const [open, setOpen] = React.useState(false);
                        return (
                          <FormItem className="">
                            <FormLabel className="">
                              Division <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                  >
                                    {field.value
                                      ? rooms.find((room) => {
                                          const roomId =
                                            room.id?.toString() || "";
                                          return roomId === field.value;
                                        })?.division || "Select Division..."
                                      : "Select Division..."}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search division..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        {loadingRooms
                                          ? "Loading divisions..."
                                          : "No division found."}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {rooms.map((room) => {
                                          const roomId =
                                            room.id?.toString() || "";
                                          return (
                                            <CommandItem
                                              key={roomId}
                                              value={roomId}
                                              onSelect={(currentValue) => {
                                                field.onChange(
                                                  currentValue === field.value
                                                    ? ""
                                                    : currentValue
                                                );
                                                setOpen(false);
                                              }}
                                            >
                                              {room.division}
                                              <Check
                                                className={cn(
                                                  "ml-auto",
                                                  field.value === roomId
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                            </CommandItem>
                                          );
                                        })}
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

                    {/* Course Title Field */}
                    <FormField
                      control={form.control}
                      name="subject_id"
                      render={({ field }) => {
                        const [open, setOpen] = React.useState(false);
                        return (
                          <FormItem className="flex-1">
                            <FormLabel className="mt-[0px]">
                              Subject <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                  >
                                    {field.value
                                      ? courses.find((course) => {
                                          const courseId =
                                            course.id?.toString() || "";
                                          return courseId === field.value;
                                        })?.subject_name || "Select Subject..."
                                      : "Select Subject..."}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search subject..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        {loadingCourses
                                          ? "Loading subjects..."
                                          : "No subject found."}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {courses.map((course) => {
                                          const courseId =
                                            course.id?.toString() || "";
                                          return (
                                            <CommandItem
                                              key={courseId}
                                              value={courseId}
                                              onSelect={(currentValue) => {
                                                field.onChange(
                                                  currentValue === field.value
                                                    ? ""
                                                    : currentValue
                                                );
                                                setOpen(false);
                                              }}
                                            >
                                              {course.subject_name}
                                              <Check
                                                className={cn(
                                                  "ml-auto",
                                                  field.value === courseId
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                            </CommandItem>
                                          );
                                        })}
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
                  </div>
                </form>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Add Scholarship
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
