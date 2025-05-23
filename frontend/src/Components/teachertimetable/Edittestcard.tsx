import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Loader2 } from 'lucide-react';

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

// Type definitions
type TimeSlot = {
  id: string;
  time: string;
  isBreak?: boolean;
};

type ApiTeacherTimetable = {
  id: number;
  staff_id: number;
  week_start_date: string;
  status: string;
  slots: ApiTimetableSlot[];
  staff?: {
    id: number;
    name: string;
  };
};

type ApiTimetableSlot = {
  id: number;
  teacher_timetable_id: number;
  day: string;
  time_slot: string;
  slot_id: string;
  is_break: boolean;
  subject_id: string | null;
  description: string | null;
  subject?: {
    id: number;
    name: string;
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

// UI Components
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

// Main component
const Edittestcard: React.FC = () => {
  // API URL base
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  
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
  
  // State variables for API data
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<{id: string; name: string}[]>([]);
  const [classes, setClasses] = useState<{id: string; name: string}[]>([]);
  const [timetableId, setTimetableId] = useState<number | null>(null);
  
  // Initialize schedule with empty slots
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    days.map(day => ({
      ...day,
      slots: Array(timeSlots.length).fill(null),
    }))
  );

  const [selectedStaff, setSelectedStaff] = useState<string>('');

  // Add week selection state with proper initialization
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => {
    const now = new Date();
    // Get current week's Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    return monday;
  });
  
  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{dayId: string; slotId: string; index: number} | null>(null);
  const [slotDetails, setSlotDetails] = useState<{subject: string; description: string}>({ subject: '', description: '' });
  
  // Fetch staff data from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/all_staff`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setStaffMembers(response.data.map(staff => ({
            id: staff.id.toString(),
            name: staff.user?.name || 'Unknown',
          })));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Failed to load staff data');
        setLoading(false);
      }
    };
    
    fetchStaff();
  }, [API_BASE]);
  
  // Fetch subjects data from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/all_subjects`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setClasses(response.data.map(subject => ({
            id: subject.id.toString(),
            name: subject.name,
          })));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subject data');
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, [API_BASE]);
  
  // Fetch timetable data when staff and week are selected
  useEffect(() => {
    if (selectedStaff && selectedWeek) {
      fetchTimetable();
    }
  }, [selectedStaff, selectedWeek]);
  
  // Function to fetch timetable data
  const fetchTimetable = async () => {
    if (!selectedStaff || !selectedWeek) {
      return;
    }
    
    try {
      setLoading(true);
      const weekStartDate = getWeekDates(selectedWeek)[0].toISOString().split('T')[0]; // Get Monday's date in YYYY-MM-DD format
      
      const response = await axios.get(`${API_BASE}/teacher-timetables-by-staff-week`, {
        params: {
          staff_id: selectedStaff,
          week_start_date: weekStartDate,
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && response.data.data) {
        const timetableData = response.data.data as ApiTeacherTimetable;
        setTimetableId(timetableData.id);
        
        // Reset the schedule with empty slots
        const emptySchedule = days.map(day => ({
          ...day,
          slots: Array(timeSlots.length).fill(null),
        }));
        
        // Fill in the slots from the API data
        if (timetableData.slots && Array.isArray(timetableData.slots)) {
          timetableData.slots.forEach(slot => {
            const dayIndex = days.findIndex(d => d.id === slot.day.toLowerCase());
            const slotIndex = timeSlots.findIndex(t => t.id === slot.slot_id);
            
            if (dayIndex !== -1 && slotIndex !== -1) {
              emptySchedule[dayIndex].slots[slotIndex] = slot.subject_id;
            }
          });
        }
        
        setSchedule(emptySchedule);
      } else {
        // No timetable found for this staff and week
        setTimetableId(null);
        // Reset the schedule with empty slots
        setSchedule(days.map(day => ({
          ...day,
          slots: Array(timeSlots.length).fill(null),
        })));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Failed to load timetable data');
      setLoading(false);
      
      // Reset the schedule with empty slots on error
      setSchedule(days.map(day => ({
        ...day,
    }
    
    setLoading(false);
    alert('Timetable saved successfully');
  } catch (err) {
    console.error('Error saving timetable:', err);
    setError('Failed to save timetable data');
    setLoading(false);
    alert('Failed to save timetable. Please try again.');
  }
};

const handleSaveDetails = async () => {
  if (currentSlot) {
    // Update the local state first
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const day = newSchedule.find(d => d.id === currentSlot.dayId);
      if (day) {
        const newSlots = [...day.slots];
        newSlots[currentSlot.index] = slotDetails.subject;
        day.slots = newSlots;
      }
      return newSchedule;
    });
    
    // If we have a timetable ID and slot data, update the slot in the backend
    if (timetableId) {
      try {
        setLoading(true);
        const timeSlot = timeSlots[currentSlot.index];
        
        // Find the slot ID in the backend
        const response = await axios.get(`${API_BASE}/teacher-timetables/${timetableId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && response.data.data && response.data.data.slots) {
          const timetableData = response.data.data as ApiTeacherTimetable;
          const slotToUpdate = timetableData.slots.find(
            slot => slot.day === currentSlot.dayId && slot.slot_id === timeSlot.id
          );
          
          if (slotToUpdate) {
            // Update the slot
            await axios.patch(`${API_BASE}/teacher-timetables/${timetableId}/slots/${slotToUpdate.id}`, {
              subject_id: slotDetails.subject,
              description: slotDetails.description
            }, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              }
            });
          } else {
            // Slot doesn't exist yet, we'll need to save the whole timetable
            await saveTimetable();
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error updating slot:', err);
        setError('Failed to update slot data');
        setLoading(false);
      }
    }
  }
  
  setIsEditDialogOpen(false);
};
    // Calculate week number
    const weekNumber = Math.ceil(
      ((firstDay.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    );
    
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  // Function to get dates for the current week
  const getWeekDates = (date: Date) => {
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Monday

    return Array(7).fill(0).map((_, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      return dayDate;
    });
  };

  // Get current week dates
  const weekDates = getWeekDates(selectedWeek);

  // Update days array to include dates
  const daysWithDates = days.map((day, index) => ({
    ...day,
    date: weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{dayId: string; slotId: string; index: number} | null>(null);
  const [slotDetails, setSlotDetails] = useState<{subject: string; description: string}>({ subject: '', description: '' });

  const handleEditClick = (dayId: string, slotId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlot({ dayId, slotId, index });

    // Get current details if they exist
    const slot = timeSlots[index];
    const details = slot.details || { subject: '', description: '' };

    setSlotDetails(details);
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (dayId: string, slotId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlot({ dayId, slotId, index });

    // Get current details if they exist
    const slot = timeSlots[index];
    const details = slot.details || { subject: '', description: '' };

    setSlotDetails(details);
    setIsViewDialogOpen(true);
  };

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
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-1">
                Select Week
              </label>
              <Input
                id="week"
                type="week"
                value={getWeekValue(selectedWeek)}
                onChange={(e) => {
                  const [year, week] = e.target.value.match(/\d+/g)?.map(Number) || [];
                  if (year && week) {
                    const date = new Date(year, 0, 1 + (week - 1) * 7);
                    date.setDate(date.getDate() + (1 - date.getDay()));
                    setSelectedWeek(date);
                  }
                }}
                onKeyDown={(e) => e.preventDefault()} // Prevent manual input
                className="w-full"
              />
            </div>
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
        {daysWithDates.map(day => (
          <div key={day.id} className="flex-1 text-center">
            <h6 className={`text-base font-bold ${day.isHoliday ? 'text-red-500' : ''}`}>
              {day.day}
            </h6>
            <p className="text-xs text-gray-500">{day.date}</p>
            {day.isHoliday && (
              <p className="text-xs text-red-400">Holiday</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        <div className="flex flex-1 gap-2">
          {daysWithDates.map((day) => (
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