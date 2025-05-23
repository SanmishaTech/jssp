import React, { useState } from 'react';
import { Eye, Edit } from 'lucide-react';

// Import Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type TimeSlot = {
  id: string;
  time: string;
  isBreak?: boolean;
  details?: {
    subject: string;
    description: string;
  };
};

type DaySchedule = {
  id: string;
  day: string;
  slots: (string | null)[];
};

type SlotProps = {
  children: React.ReactNode;
  day: { id: string };
  slot: { id: string };
  index: number;
  onViewClick: (dayId: string, slotId: string, index: number, e: React.MouseEvent) => void;
  onEditClick: (dayId: string, slotId: string, index: number, e: React.MouseEvent) => void;
};

const TimeSlot = ({ children, day, slot, index, onViewClick, onEditClick }: SlotProps) => (
  <Card className="p-2 text-center min-h-[100px] flex items-center justify-center relative">
    <div className="absolute top-1 right-1 flex gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onViewClick(day.id, slot.id, index, e);
        }}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onEditClick(day.id, slot.id, index, e);
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
    {children}
  </Card>
);

const BreakSlot = ({ children }: { children: React.ReactNode }) => (
  <Card className="p-2 text-center min-h-[100px] flex items-center justify-center bg-gray-200 text-gray-500 italic">
    {children}
  </Card>
);

const Edittestcard: React.FC = () => {
  // Generate time slots from 10 AM to 5 PM
  const timeSlots: TimeSlot[] = [
    { id: '10', time: '10:00 AM - 11:00 AM' },
    { id: '11', time: '11:00 AM - 12:00 PM' },
    { id: '12', time: '12:00 PM - 1:00 PM' },
    { id: 'break', time: '1:00 PM - 2:00 PM', isBreak: true },
    { id: '14', time: '2:00 PM - 3:00 PM' },
    { id: '15', time: '3:00 PM - 4:00 PM' },
    { id: '16', time: '4:00 PM - 5:00 PM' },
  ];

  const days = [
    { id: 'monday', day: 'Monday' },
    { id: 'tuesday', day: 'Tuesday' },
    { id: 'wednesday', day: 'Wednesday' },
    { id: 'thursday', day: 'Thursday' },
    { id: 'friday', day: 'Friday' },
    { id: 'saturday', day: 'Saturday (Holiday)', isHoliday: true },
    { id: 'sunday', day: 'Sunday (Holiday)', isHoliday: true }
  ];

  // Initialize schedule with empty slots
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    days.map(day => ({
      ...day,
      slots: Array(timeSlots.length).fill(null),
    }))
  );

  const handleClassRemove = (dayId: string, slotIndex: number) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const day = newSchedule.find(d => d.id === dayId);
      if (day) {
        const newSlots = [...day.slots];
        newSlots[slotIndex] = null;
        day.slots = newSlots;
      }
      return newSchedule;
    });
  };

  // Sample classes/subjects that can be scheduled
  const classes = [
    { id: 'math', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' },
    { id: 'english', name: 'English' },
    { id: 'history', name: 'History' },
    { id: 'geography', name: 'Geography' },
    { id: 'computer', name: 'Computer Science' },
  ];

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);

  // Format dates as YYYY-MM-DD for the input element
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  
  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{dayId: string; slotId: string; index: number} | null>(null);
  const [slotDetails, setSlotDetails] = useState<{subject: string; description: string}>({ subject: '', description: '' });

  // Sample staff data
  const staffMembers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Robert Johnson' },
    { id: '4', name: 'Emily Davis' },
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handle opening the edit dialog
  const handleEditClick = (dayId: string, slotId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlot({ dayId, slotId, index });
    
    // Get current details if they exist
    const slot = timeSlots[index];
    const details = slot.details || { subject: '', description: '' };
    
    setSlotDetails(details);
    setIsEditDialogOpen(true);
  };

  // Handle opening the view dialog
  const handleViewClick = (dayId: string, slotId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlot({ dayId, slotId, index });
    
    // Get current details if they exist
    const slot = timeSlots[index];
    const details = slot.details || { subject: '', description: '' };
    
    setSlotDetails(details);
    setIsViewDialogOpen(true);
  };

  // Handle saving the details
  const handleSaveDetails = () => {
    if (!currentSlot) return;
    
    // Update the time slot with the new details
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[currentSlot.index] = {
      ...updatedTimeSlots[currentSlot.index],
      details: slotDetails
    };
    
    // Close the dialog
    setIsEditDialogOpen(false);
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h4 className="text-lg font-bold">
          Teacher's Weekly Schedule
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Select Date:
            </span>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={formatDate(sixMonthsAgo)}
              max={formatDate(sixMonthsFromNow)}
              className="py-2 px-3 rounded-md border border-gray-300 text-sm h-[38px] w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Select Staff:
            </span>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="py-2 px-3 rounded-md border border-gray-300 text-sm h-[38px] w-[150px]"
            >
              <option value="">
                Select a staff member
              </option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-3 justify-between">
        {days.map(day => (
          <div key={day.id} className="flex-1 text-center">
            <h6 className={`text-base font-bold ${day.isHoliday ? 'text-red-500' : ''}`}>
              {day.day}
            </h6>
            {day.isHoliday && (
              <p className="text-xs text-red-400">Holiday</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        <div className="flex flex-1 gap-2">
          {days.map((day) => (
            <div key={day.id} className="flex-1 flex flex-col gap-1">
              {timeSlots.map((slot, index) => {
                const classId = schedule.find(d => d.id === day.id)?.slots[index];
                const classInfo = classes.find(c => c.id === classId);
                
                return (
                  <React.Fragment key={slot.id}>
                    {slot.isBreak ? (
                      <BreakSlot 
                        children={
                          <span className="text-xs">
                            Lunch Break
                          </span>
                        }
                      />
                    ) : (
                      <TimeSlot 
                        day={day} 
                        slot={slot} 
                        index={index}
                        onViewClick={handleViewClick}
                        onEditClick={handleEditClick}
                      >
                        {classInfo ? (
                          <div
                            className="bg-blue-500 text-white p-1 rounded-md cursor-pointer hover:opacity-90"
                            onClick={() => handleClassRemove(day.id, index)}
                          >
                            {classInfo.name}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {slot.time}
                          </span>
                        )}
                      </TimeSlot>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
    
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
            <DialogDescription>
              Update the details for this time slot. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="subject" className="text-right">
                Subject
              </label>
              <div className="col-span-3">
                <Select 
                  value={slotDetails.subject} 
                  onValueChange={(value: string) => setSlotDetails({...slotDetails, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  placeholder="Add notes or description"
                  value={slotDetails.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSlotDetails({...slotDetails, description: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              onClick={handleSaveDetails}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-blue-500 text-white shadow hover:bg-blue-500/90 h-9 px-4 py-2"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>View Time Slot</DialogTitle>
            <DialogDescription>
              Details for this time slot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Subject:</span>
              <div className="col-span-3">
                {slotDetails.subject ? 
                  classes.find(c => c.id === slotDetails.subject)?.name || 'Not selected' : 
                  'Not selected'}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-right font-medium">Description:</span>
              <div className="col-span-3 whitespace-pre-wrap break-words">
                {slotDetails.description || 'No description provided'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Edittestcard;