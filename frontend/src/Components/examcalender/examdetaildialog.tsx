import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/Components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Exam, Supervisor } from "./calender";
import { Calendar, Clock, Tag, Timer, Users } from 'lucide-react';

interface ExamDetailDialogProps {
  exam: Exam;
  onClose: () => void;
  allStaff: Supervisor[];
}

const ExamDetailDialog: React.FC<ExamDetailDialogProps> = ({
  exam,
  onClose,
  allStaff,
}) => {

  const getSupervisorName = (staffId: number) => {
    const staff = allStaff.find(s => s.id === staffId);
    return staff ? staff.staff_name : `Unknown Staff (ID: ${staffId})`;
  };

  const assignedStaffIds = exam.staff_id || [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold break-words pr-6">{exam.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Calendar className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="font-medium text-gray-600">Date</span>
              <span className="text-gray-800">{new Date(exam.date).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Tag className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="font-medium text-gray-600">Exam Code</span>
              <span className="break-all text-gray-800">{exam.exam_code}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Tag className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="font-medium text-gray-600">Exam Name</span>
              <span className="break-words text-gray-800">{exam.exam_id_name}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Clock className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="font-medium text-gray-600">Time</span>
              <span className="text-gray-800">{exam.time}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Timer className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="font-medium text-gray-600">Duration</span>
              <span className="text-gray-800">{exam.duration_minutes} minutes</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center space-x-3">
                <Users className="h-6 w-6 shrink-0 text-gray-600" />
                <h4 className="text-lg font-semibold">Assigned Supervisors</h4>
            </div>
            {(assignedStaffIds.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                    {assignedStaffIds.map((staffId: number) => (
                        <span key={staffId} className="mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                            {getSupervisorName(staffId)}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No supervisors assigned.</p>
            )}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-6">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamDetailDialog;
