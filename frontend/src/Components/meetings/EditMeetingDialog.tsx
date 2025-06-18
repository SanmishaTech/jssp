import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Editor } from "primereact/editor";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const meetingSchema = z.object({
  venue: z.string().trim().nonempty("Venue is required"),
  date: z.string().trim().nonempty("Date is required"),
  time: z.string().trim().nonempty("Time is required"),
  synopsis: z.any().optional(),
});

type MeetingEditValues = z.infer<typeof meetingSchema>;

interface Meeting {
  id: number;
  venue?: string;
  date?: string;
  time?: string;
  synopsis?: string;
  committee_id?: number;
  [key: string]: any;
}

interface Props {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditMeetingDialog({ meeting, isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const form = useForm<MeetingEditValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      venue: "",
      date: "",
      time: "",
      synopsis: "",
    },
  });

  // populate form when dialog opens
  useEffect(() => {
    if (meeting) {
      form.reset({
        venue: meeting.venue || "",
        date: meeting.date ? meeting.date.slice(0, 10) : "",
        time: meeting.time || "",
        synopsis: meeting.synopsis || "",
      });
    }
  }, [meeting, form]);

  const updateMeetingMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!meeting) return;
      return axios.put(`/api/committee-meetings/${meeting.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Meeting updated successfully");
      queryClient.invalidateQueries({ queryKey: ["committeeMeetings"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error updating meeting");
    },
  });

  const onSubmit = (data: MeetingEditValues) => {
    updateMeetingMutation.mutate({ ...data, committee_id: meeting?.committee_id });
  };

  if (!meeting) return null;

  return (
    <Modal backdrop="blur" size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              Edit Meeting
            </ModalHeader>
            <ModalBody>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="synopsis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Synopsis</FormLabel>
                        <FormControl>
                          <Editor
                            className="w-full"
                            value={field.value || ""}
                            onTextChange={(e) => field.onChange(e.htmlValue)}
                            style={{ minHeight: 200, maxHeight: 300 }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button variant="bordered" onPress={onClose} className="mr-2">
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={form.handleSubmit(onSubmit) as any}
                isDisabled={updateMeetingMutation.isPending}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
