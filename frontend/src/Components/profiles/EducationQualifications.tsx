import { X } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, UseFormReturn } from "react-hook-form";

interface EducationQualificationsProps {
  form: UseFormReturn<any>;
}

export default function EducationQualifications({ form }: EducationQualificationsProps) {
  const { control } = form;
  
  // UseFieldArray hook for managing dynamic education fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // Function to add a new education field
  const addEducationField = () => {
    append({
      qualification: '',
      college_name: '',
      board_university: '',
      passing_year: '',
      percentage: '',
    });
  };

  // Function to handle removal of an education field
  const removeEducationField = (index: number) => {
    remove(index);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Educational Qualifications</CardTitle>
        </div>
        <CardDescription>Add your educational qualifications and details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Qualification</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Institute Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Board/University</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Passing Year</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.qualification`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="Degree/Diploma" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.college_name`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="College/Institution" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.board_university`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="Board/University" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.passing_year`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="YYYY" 
                              {...field} 
                              className="w-full"
                              maxLength={4}
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/\D/g, "").substring(0, 4);
                              }}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <FormField
                        control={control}
                        name={`education.${index}.percentage`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              placeholder="0-100" 
                              {...field} 
                              className="w-full"
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9.]/g, "");
                                if (target.value !== '' && parseFloat(target.value) > 100) {
                                  target.value = '100';
                                }
                              }}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button
                        type="button"
                        onClick={() => removeEducationField(index)}
                        className="bg-blue-300 hover:bg-blue-600 text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            onClick={addEducationField}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 