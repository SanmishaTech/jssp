import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/Components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Exam } from "./calender";
import { Calendar, Clock, Tag, Timer, Users } from 'lucide-react';

interface ExamDetailDialogProps {
  exam: Exam;
  onClose: () => void;
}

const ExamDetailDialog: React.FC<ExamDetailDialogProps> = ({
  exam,
  onClose,
}) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-50 sm:max-w-2xl rounded-lg p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{exam.title}</DialogTitle>
        </DialogHeader>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-600">Date</span>
              <span className="text-gray-800">{new Date(exam.date).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-600">Exam Code</span>
              <span className="text-gray-800">{exam.exam_code}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-600">Time</span>
              <span className="text-gray-800">{exam.time}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Timer className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-600">Duration</span>
              <span className="text-gray-800">{exam.duration_minutes} minutes</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-4">
            <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-gray-600" />
                <h4 className="text-lg font-semibold">Assigned Supervisors</h4>
            </div>
            {(exam.supervisors && exam.supervisors.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                    {exam.supervisors.map((supervisor) => (
                        <span key={supervisor.id} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                            {supervisor.staff_name}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No supervisors assigned.</p>
            )}
        </div>

        <DialogFooter className="pt-6 flex justify-end space-x-3">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamDetailDialog;
