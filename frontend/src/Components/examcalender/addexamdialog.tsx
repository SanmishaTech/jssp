import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/Components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultipleSelector, { Option } from '@/Components/ui/multiselect';
import axios from 'axios';
import { Supervisor } from './calender';

interface ExamOption {
  id: number;
  exam_title: string;
}

interface SubjectOption {
  id: number;
  subject_name: string;
}

export interface ExamFormData {
  id?: number;
  exam_name?: string;
  exam_code?: string;
  date?: string;
  exam_time?: string;
  duration_minutes?: number;
  subject_id?: number;
  exam_id?: number;
  staff_id?: number[];
}

const profileFormSchema = z.object({
    date: z.string().nonempty("Date is required"),
    exam_name: z.string().trim().nonempty("Exam Name is Required"),
    exam_code: z.string().optional(),
    exam_time: z.string().optional(),
    duration_minutes: z.coerce.number().optional(),
    subject_id: z.coerce.number().optional(),
    exam_id: z.coerce.number().optional(),
    staff_id: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).min(1, "At least one Staff is Required").max(2, "You can select a maximum of 2 staff members"),
  });
  
type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AddExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allExams: ExamOption[];
  allSubjects: SubjectOption[];
  allStaff: Supervisor[];
  fetchData: () => void;
  examToEdit?: ExamFormData;
  selectedDate: Date;
}

const AddExamDialog: React.FC<AddExamDialogProps> = ({ open, onOpenChange, allExams, allSubjects, allStaff, fetchData, examToEdit, selectedDate }) => {
  const [staffOptions, setStaffOptions] = useState<Option[]>([]);
  const isEditMode = !!examToEdit;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        date: '',
        exam_name: '',
        exam_code: '',
        exam_time: '',
        duration_minutes: undefined,
        subject_id: undefined,
        exam_id: undefined,
        staff_id: [],
    },
  });

  useEffect(() => {
    if (open) {
      const options = allStaff
        .filter((s) => s.role === 'teachingstaff')
        .map((s) => ({
          value: s.id.toString(),
          label: s.staff_name,
        }));
      setStaffOptions(options);

      if (examToEdit) {
        const staffIdsAsOptions = (examToEdit.staff_id || []).map((id: number) => {
          const staffMember = options.find((opt) => opt.value === id.toString());
          return staffMember || { value: id.toString(), label: `Staff ID: ${id}` };
        });
        form.reset({
          ...examToEdit,
          date: examToEdit.date ? examToEdit.date.split('T')[0] : '',
          staff_id: staffIdsAsOptions,
        });
      } else {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        form.reset({
          date: formattedDate,
          exam_name: '',
          exam_code: '',
          exam_time: '',
          duration_minutes: undefined,
          subject_id: undefined,
          exam_id: undefined,
          staff_id: [],
        });
      }
    }
  }, [open, examToEdit, form, selectedDate, allStaff]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const submissionData = {
        ...data,
        staff_id: data.staff_id.map(option => option.value),
      };

      if (isEditMode) {
        await axios.put(`/api/exam-calendars/${examToEdit.id}`, submissionData);
        toast.success("Exam updated successfully");
      } else {
        await axios.post('/api/exam-calendars', submissionData);
        toast.success("Exam added successfully");
      }
      fetchData();
      onOpenChange(false);
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("An error occurred during submission.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-lg rounded-lg p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="exam_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exam</FormLabel>
                        <FormControl>
                            <select {...field} className="border rounded-md p-2 w-full">
                                <option value="" disabled>Select Exam</option>
                                {allExams.map((ex) => (
                                    <option key={ex.id} value={ex.id}>{ex.exam_title}</option>
                                ))}
                            </select>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="exam_name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exam Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Enter exam name" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                            <Input {...field} type="date" disabled />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="subject_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <select {...field} className="border rounded-md p-2 w-full">
                                <option value="" disabled>Select Subject</option>
                                {allSubjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                                ))}
                            </select>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                 <FormField
                    control={form.control}
                    name="staff_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Staff</FormLabel>
                        <FormControl>
                            <MultipleSelector
                                value={field.value}
                                onChange={(options) => {
                                    if (options.length > 2) {
                                        toast.warning("You can only select up to 2 staff members.");
                                    } else {
                                        field.onChange(options);
                                    }
                                }}
                                options={staffOptions}
                                placeholder="Select staff..."
                                emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">No Staff Found.</p>}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="exam_code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exam Code</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Enter exam code" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="exam_time"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exam Time</FormLabel>
                        <FormControl>
                            <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exam Duration (minutes)</FormLabel>
                        <FormControl>
                            <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                )}/>
                <DialogFooter className="pt-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">{isEditMode ? 'Update' : 'Save'}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamDialog;
