import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  gst_number: z.string().trim().nonempty("GST Number is Required"),
  organization_pan_number: z.string().trim().optional(),
  bank_name: z.string().trim().optional(),
  bank_account_holder_name: z.string().trim().optional(),
  bank_account_number: z.string().trim().optional(),
  bank_ifsc_code: z.string().trim().optional(),
  bank_branch: z.string().trim().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  contact_state: "Maharashtra",
  contact_country: "India",
};

function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");

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
          <div className="max-w-full p-4 ">
            <div className="pt-4 mb-4">Vendor Information</div>
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
            <div className="my-4" />
            {/* Contact Information */}
            <div className="pt-4 mb-4">Contact Information</div>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const numericValue = (e.target as HTMLInputElement).value.replace(/\D/g, ''); // remove non-digits
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
            <div className="my-4" />
            <div className="grid grid-cols-3 gap-3 mb-3">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                          <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                          <SelectItem value="Assam">Assam</SelectItem>
                          <SelectItem value="Bihar">Bihar</SelectItem>
                          <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                          <SelectItem value="Goa">Goa</SelectItem>
                          <SelectItem value="Gujarat">Gujarat</SelectItem>
                          <SelectItem value="Haryana">Haryana</SelectItem>
                          <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                          <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Kerala">Kerala</SelectItem>
                          <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Manipur">Manipur</SelectItem>
                          <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                          <SelectItem value="Mizoram">Mizoram</SelectItem>
                          <SelectItem value="Nagaland">Nagaland</SelectItem>
                          <SelectItem value="Odisha">Odisha</SelectItem>
                          <SelectItem value="Punjab">Punjab</SelectItem>
                          <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="Sikkim">Sikkim</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="Telangana">Telangana</SelectItem>
                          <SelectItem value="Tripura">Tripura</SelectItem>
                          <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                          <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
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
            <div className="my-4" />
            {/* Tax Information */}
            <div className="pt-4 mb-4">Tax Information</div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <FormField
                control={form.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      GST Number
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="GST Number..." {...field} />
                    </FormControl>
                    <FormMessage />
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
            <div className="my-4" />
            {/* Bank Information */}
            <div className="pt-4 mb-4">Bank Information</div>
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
          </div>
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
    <div className="min-w-[350px] overflow-auto bg-light shadow-md pt-4 ">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        Back
      </Button>

      <div className="pt-4 mb-4">Vendor Master</div>
      <div className="pt-4 mb-4">Add Vendor</div>
      <div className="space-y-6 ">
        <ProfileForm />
      </div>
    </div>
  );
}
