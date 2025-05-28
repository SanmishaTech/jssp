import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";

const profileFormSchema = z.object({
  userId: z.string().optional(),
  vendor_name: z.string().trim().nonempty("Vendor Name is Required"),
  organization_name: z.string().trim().nonempty("Organization Name is Required"),
  contact_name: z.string().trim().nonempty("Contact Name is Required"),
  contact_number: z.string().trim().optional(),
  contact_email: z.string().trim().nonempty("Contact Email is Required").email("Invalid Email"),
  contact_address: z.string().trim().nonempty("Contact Address is Required"),
  contact_city: z.string().trim().optional(),
  contact_state: z.string().trim().nonempty("Contact State is Required"),
  contact_pincode: z.string().trim().optional(),
  contact_country: z.string().trim().optional(),
  website: z.string().trim().optional(),
   gst_number: z.string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/, {
    message: "Invalid GST Number. Please enter a valid GSTIN. ",
  })
  .max(15, "GST Number must be exactly 15 characters")
  .min(15, "GST Number must be exactly 15 characters"),
  organization_pan_number: z.string().trim().optional(),
  bank_name: z.string().trim().optional(),
  bank_account_holder_name: z.string().trim().optional(),
  bank_account_number: z.string().trim().optional(),
  bank_ifsc_code: z.string().trim().optional(),
  bank_branch: z.string().trim().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {};

function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");
  //   const { fields, append } = useFieldArray({
  //     name: "urls",
  //     control: form.control,
  //   });

  async function onSubmit(data: ProfileFormValues) {
    data.userId = User?._id;
    try {
      await axios
        .post(`/api/vendors`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.success("Vendor Created Successfully");
          window.history.back();
        });
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
              <div className="grid grid-cols-2 gap-3 mb-3">
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
              
              </div>
              <Separator className="my-4" />
              {/* Contact Information */}
              <CardTitle className="pt-4 mb-4">Contact Information</CardTitle>
              <div className="grid grid-cols-2 gap-3 mb-3">
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
                        <Input type="email" placeholder="Contact Email..." {...field} />
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
      <FormLabel>Contact Number</FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder="Contact Number..."
          maxLength={10}
          inputMode="numeric"
          pattern="\d{10}"
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, ''); // remove non-digits
            field.onChange(numericValue);
          }}
          value={field.value || ''}
        />
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
                        <Input placeholder=" Address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-2 gap-3 mb-3">
              
                <FormField
                  control={form.control}
                  name="contact_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                         City
                      </FormLabel>
                      <FormControl>
                        <Input placeholder=" City..." {...field} />
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
                        <Input placeholder=" State..." {...field} />
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
                        <Input placeholder="Pincode..." {...field} />
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
                        <Input placeholder="Country..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              {/* Tax Information */}
              <CardTitle className="pt-4 mb-4">Tax Information</CardTitle>
              <div className="grid grid-cols-2 gap-3 mb-3">
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
      <FormLabel>Organization PAN Number</FormLabel>
      <FormControl>
        <Input
          placeholder="ABCDE1234F"
          {...field}
          maxLength={10}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            field.onChange(value);
          }}
        />
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
      <FormLabel>Bank IFSC Code</FormLabel>
      <FormControl>
        <Input
          placeholder="Bank IFSC Code..."
          {...field}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            const regex = /^[A-Z]{4}[0-9][A-Z0-9]{6}$/;
            field.onChange(value);
            if (!regex.test(value) && value.length === 11) {
              form.setError("bank_ifsc_code", {
                type: "manual",
                message: "Invalid IFSC code format",
              });
            } else {
              form.clearErrors("bank_ifsc_code");
            }
          }}
        />
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
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Vendor
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
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
        <CardTitle>Vendor Master</CardTitle>
        <CardDescription>Add Vendor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
