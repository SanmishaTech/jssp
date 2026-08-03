import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { format } from "date-fns";
import { Calendar, Clock, Info, MapPin, Users } from 'lucide-react';

interface Meeting {
  id: number;
  venue?: string;
  date?: string;
  time?: string;
  synopsis?: string;
  staff?: any[];
  [key: string]: any; // allow any additional fields
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  meeting?: Meeting | null;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1 @[480px]/meeting-detail:flex-row @[480px]/meeting-detail:items-start">
    <dt className="flex w-full shrink-0 items-center text-sm font-medium text-gray-500 @[480px]/meeting-detail:w-28">
      {icon}
      <span className="ml-2">{label}</span>
    </dt>
    <dd className="min-w-0 break-words text-sm text-gray-900 @[480px]/meeting-detail:ml-4">{value}</dd>
  </div>
);

export default function MeetingDetailsDialog({ isOpen, onClose, meeting }: Props) {
  if (!meeting) return null;

  const formattedDate = meeting.date ? format(new Date(meeting.date), "EEEE, MMMM do, yyyy") : 'N/A';
  const formattedTime = meeting.time ? format(new Date(`1970-01-01T${meeting.time}`), "h:mm a") : 'N/A';

  return (
    <Modal
      backdrop="blur"
      size="2xl"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        wrapper: "items-center justify-center p-4",
        base: "mx-auto my-auto max-h-[90dvh] w-full",
        footer: "flex flex-col-reverse gap-2 sm:flex-row sm:gap-2",
      }}
    >
      <ModalContent className="@container/meeting-detail">
        {() => (
          <>
            <ModalHeader className="flex min-w-0 items-center gap-2 border-b pb-4">
                <div className="shrink-0 rounded-full bg-primary/10 p-2">
                    <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold">Meeting Details</h2>
                    <p className="truncate text-sm text-gray-500">
                        {meeting.venue} • {formattedDate}
                    </p>
                </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <dl className="space-y-4">
                  <DetailItem icon={<Calendar size={16} />} label="Date" value={formattedDate} />
                  <DetailItem icon={<Clock size={16} />} label="Time" value={formattedTime} />
                  <DetailItem icon={<MapPin size={16} />} label="Venue" value={meeting.venue || 'N/A'} />
                  {meeting.staff && (
                    <DetailItem 
                      icon={<Users size={16} />} 
                      label="Attendees"
                      value={(meeting.staff as any[]).map(s => s.staff_name || s.name).join(', ') || 'N/A'}
                    />
                  )}
                </dl>

                {meeting.synopsis && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2 border-t pt-4">Synopsis</h3>
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-3 rounded-md"
                      dangerouslySetInnerHTML={{ __html: meeting.synopsis }}
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="border-t pt-4">
              <Button variant="bordered" onPress={onClose} className="w-full sm:w-auto">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
