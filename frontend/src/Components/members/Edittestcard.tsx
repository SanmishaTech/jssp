import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  associateType: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organization: z
    .string()
    .min(2, {
      message: "Organization must be at least 2 characters.",
    })
    .max(30, {
      message: "Organization must not be longer than 30 characters.",
    }),
  country: z
    .string()
    .min(2, {
      message: "Country must be at least 2 characters.",
    })
    .max(30, {
      message: "Country must not be longer than 30 characters.",
    }),
  state: z
    .string()
    .min(2, {
      message: "State must be at least 2 characters.",
    })
    .max(30, {
      message: "State must not be longer than 30 characters.",
    }),
  city: z
    .string()
    .min(2, {
      message: "City must be at least 2 characters.",
    })
    .max(30, {
      message: "City must not be longer than 30 characters.",
    }),
  address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .max(30, {
      message: "Address must not be longer than 30 characters.",
    }),
  telephone: z
    .string()
    .min(2, {
      message: "Telephone must be at least 2 characters.",
    })
    .max(30, {
      message: "Telephone must not be longer than 30 characters.",
    }),
  mobile: z
    .string()
    .min(2, {
      message: "Mobile must be at least 2 characters.",
    })
    .max(30, {
      message: "Mobile must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .min(2, {
      message: "Email must be at least 2 characters.",
    })
    .max(30, {
      message: "Email must not be longer than 30 characters.",
    }),
  degree: z
    .string()
    .min(2, {
      message: "Degree must be at least 2 characters.",
    })
    .max(30, {
      message: "Degree must not be longer than 30 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.

function ProfileForm({ formData }) {
  console.log("This is formData", formData);
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const { id } = useParams();

  const { reset } = form;

  // Reset form values when formData changes
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const navigate = useNavigate();

  async function onSubmit(data: ProfileFormValues) {
    // console.log("Sas", data);
    await axios.put(`/api/associatemaster/update/${id}`, data).then((res) => {
      toast.success("Associate Master Updated Successfully");
      navigate("/associatemaster");
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        {" "}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-full p-4">
          <FormField
            className="flex-1"
            control={form.control}
            name="associateType"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Associate Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  className="w-full"
                >
                  <FormControl className="w-full">
                    <SelectTrigger value={field.value}>
                      {" "}
                      <SelectValue placeholder="Select Associate type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This is the type of Associate you are selecting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            className="flex-1"
            control={form.control}
            name="salutation"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>select Salutation</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  className="w-full"
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baby">Baby</SelectItem>
                    <SelectItem value="dr">Dr</SelectItem>
                    <SelectItem value="mr">Mr</SelectItem>
                    <SelectItem value="mrs">Mrs</SelectItem>
                    <SelectItem value="ms">Ms</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>How should we address you?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name..." {...field} />
                </FormControl>
                <FormDescription>What is your first name?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name..." {...field} />
                </FormControl>
                <FormDescription>What is your last name?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-full p-4">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input placeholder="Organization..." {...field} />
                </FormControl>
                <FormDescription>
                  What is your name of organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            className="flex-1"
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>select Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  className="w-full"
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="china">China</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="usa">USA</SelectItem>
                    <SelectItem value="uk">UK</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>What is your country?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            className="flex-1"
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>select State</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  className="w-full"
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a State" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="gujarat">Gujarat</SelectItem>
                    <SelectItem value="rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="tamilnadu">Tamilnadu</SelectItem>
                    <SelectItem value="telangana">Telangana</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>What is your State?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            className="flex-1"
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>select City</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  className="w-full"
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dombivli">Dombivli</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>What is your country?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-full p-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Address..." {...field} />
                </FormControl>
                <FormDescription>What is your name of Address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <Input placeholder="Telephone..." {...field} />
                </FormControl>
                <FormDescription>
                  What is your name of Telephone
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input placeholder="Mobile..." {...field} />
                </FormControl>
                <FormDescription>What is your name of Mobile.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email..." {...field} />
                </FormControl>
                <FormDescription>What is your name of Email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <FormControl>
                  <Input placeholder="Degree..." {...field} />
                </FormControl>
                <FormDescription>What is your name of Degree.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end w-full ">
          <Button className="self-center mr-8" type="submit">
            Update profile
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<any>({});
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/associatemaster/reference/${id}`);
      console.log(response.data);
      setFormData(response.data);
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
        onClick={() => navigate("/associatemaster")}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5 text-white" />
        Back
      </Button>

      <CardHeader>
        <CardTitle>Associate Master</CardTitle>
        <CardDescription>Associate master</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <Separator />
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
