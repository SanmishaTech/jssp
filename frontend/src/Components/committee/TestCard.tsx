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
import { X, ChevronLeft } from "lucide-react";

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

export default function CommitteeForm() {
  const navigate = useNavigate();
  const form = useForm<CommitteeFormValues>({
    resolver: zodResolver(committeeSchema),
    defaultValues: {
      committee_name: "",
      staff: [{ staff_id: "", designation: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "staff",
  });

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
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error creating committee"
        );
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
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`staff.${index}.staff_id`}
                            render={({ field }) => (
                              <FormControl>
                                <Input placeholder="Staff ID" {...field} />
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
                    ))}
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
