import { useState, useEffect } from "react";
// import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";

const profileFormSchema = z.object({
  vendor_name: z.string().trim().nonempty("Vendor Name is Required"),
  organization_name: z.string().trim().nonempty("Organization Name is Required"),
  contact_name: z.string().trim().nonempty("Contact Name is Required"),
  contact_number: z.string().trim().nonempty("Contact Number is Required"),
  contact_email: z.string().trim().nonempty("Contact Email is Required"),
  contact_address: z.string().trim().nonempty(" Address is Required"),
  contact_city: z.string().trim().nonempty(" City is Required"),
  contact_state: z.string().trim().nonempty(" State is Required"),
  contact_pincode: z.string().trim().nonempty(" Pincode is Required"),
  contact_country: z.string().trim().nonempty(" Country is Required"),
  website: z.string().trim().nonempty("Website is Required"),
  gst_number: z.string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/, {
    message: "Invalid GST Number. Please enter a valid GSTIN. ",
  })
  .max(15, "GST Number must be exactly 15 characters")
  .min(15, "GST Number must be exactly 15 characters"),  organization_pan_number: z.string().trim().nonempty("Organization PAN Number is Required"),
  bank_name: z.string().trim().nonempty("Bank Name is Required"),
  bank_account_holder_name: z.string().trim().nonempty("Bank Account Holder Name is Required"),
  bank_account_number: z.string().trim().nonempty("Bank Account Number is Required"),
  bank_ifsc_code: z.string().trim().nonempty("Bank IFSC Code is Required"),
  bank_branch: z.string().trim().nonempty("Bank Branch is Required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.

function ProfileForm({ formData }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const { id } = useParams({ from: "/vendors/edit/$id" });

  const { reset } = form;

  // Reset form values when formData changes
  useEffect(() => {
    
    reset(formData);
    
  }, [formData, reset]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axios.put(`/api/vendors/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Vendor Updated Successfully");
      navigate({ to: "/vendors" });
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
          {/* Room Information Section */}
          <Card className="max-w-full p-4 ">
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="vendor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Vendor Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Vendor Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Organization Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Organization Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              {/* Contact Information */}
              <CardTitle className="pt-4 mb-4">Contact Information</CardTitle>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact Email
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Email..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Number..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Website..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              <FormField
                  control={form.control}
                  name="contact_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                         Address
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-4 gap-3 mb-3">
               
                <FormField
                  control={form.control}
                  name="contact_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                         City
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact City..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                         State
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact State..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               
                <FormField
                  control={form.control}
                  name="contact_pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                         Pincode
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Pincode..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                         Country
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Country..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              {/* Tax Information */}
              <CardTitle className="pt-4 mb-4">Tax Information</CardTitle>
              <div className="grid grid-cols-3 gap-3 mb-3">
              <FormField
                control={form.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">GST IN 
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        maxLength={15}
                        {...field}
                        style={{ textTransform: "uppercase" }}
                        placeholder="Enter GST Number"
                        className="bg-background text-foreground border-input"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
                <FormField
                  control={form.control}
                  name="organization_pan_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Organization PAN Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Organization PAN Number..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              {/* Bank Information */}
              <CardTitle className="pt-4 mb-4">Bank Information</CardTitle>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bank Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Bank Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank_account_holder_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bank Account Holder Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Bank Account Holder Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bank Account Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Bank Account Number..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank_ifsc_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bank IFSC Code
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Bank IFSC Code..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank_branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bank Branch
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Bank Branch..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/vendors" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Vendor
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/vendors/edit/$id" });
  const [formData, setFormData] = useState<any>({});
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/vendors/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(response.data.data.Vendor);
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
