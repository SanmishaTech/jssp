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
    id: string;
    subject_name: string;
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
const TimeSlotComponent = ({ children, day, slot, index, onViewClick, onEditClick }: SlotProps) => (
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
const TeacherTimetable: React.FC = () => {
  // API URL base
  const API_BASE = '/api';
  
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
  const [subjects, setSubjects] = useState<{id: string; name: string}[]>([]);
  const [timetableId, setTimetableId] = useState<number | null>(null);
  
  // Initialize schedule with empty slots
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    days.map(day => ({
      ...day,
      slots: Array(timeSlots.length).fill(null),
    }))
  );

  // Initialize selectedStaff from localStorage or empty string if not found
  const [selectedStaff, setSelectedStaff] = useState<string>(() => {
    const savedStaff = localStorage.getItem('teacherTimetable_selectedStaff');
    return savedStaff || '';
  });

  // Initialize selectedWeek from localStorage or current week's Monday if not found
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => {
    const savedWeek = localStorage.getItem('teacherTimetable_selectedWeek');
    if (savedWeek) {
      return new Date(savedWeek);
    }
    
    // Default to current week's Monday if no saved value
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    return monday;
  });
  
  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{dayId: string; slotId: string; index: number} | null>(null);
  const [slotDetails, setSlotDetails] = useState<{subject: string; description: string}>({ subject: '', description: '' });
  
  // Function to get ISO week string for input
  const getWeekValue = (date: Date) => {
    const year = date.getFullYear();
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    
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
  
  // Fetch teaching staff data from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/teaching-staff`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setStaffMembers(response.data.map((staff: any) => ({
            id: staff.id.toString(),
            name: staff.user?.name || 'Unknown',
          })));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teaching staff:', err);
        setError('Failed to load teaching staff data');
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
        
        if (response.data && response.data.status && response.data.data && response.data.data.Subject) {
          setSubjects(response.data.data.Subject.map((subject: any) => ({
            id: subject.id.toString(),
            name: subject.subject_name,
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
  
  // Save selectedStaff to localStorage when it changes
  useEffect(() => {
    if (selectedStaff) {
      localStorage.setItem('teacherTimetable_selectedStaff', selectedStaff);
    }
  }, [selectedStaff]);

  // Save selectedWeek to localStorage when it changes
  useEffect(() => {
    if (selectedWeek) {
      localStorage.setItem('teacherTimetable_selectedWeek', selectedWeek.toISOString());
    }
  }, [selectedWeek]);
  
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
    
    setLoading(true);
    setError(null); // Clear any previous errors
    const weekStartDate = getWeekDates(selectedWeek)[0].toISOString().split('T')[0]; // Get Monday's date in YYYY-MM-DD format
    
    // Create an empty schedule regardless of API response
    const emptySchedule = days.map(day => ({
      ...day,
      slots: Array(timeSlots.length).fill(null),
    }));
    
    try {
      // Try to fetch the timetable data, but don't let a 404 cause an error
      let response;
      try {
        response = await axios.get(`${API_BASE}/teacher-timetables-by-staff-week`, {
          params: {
            staff_id: selectedStaff,
            week_start_date: weekStartDate,
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Timetable API response:', response.data); // Log the response for debugging
      } catch (apiError: any) {
        // Handle the specific case of 404 "Timetable not found"
        if (apiError.response && apiError.response.status === 404) {
          console.log('No timetable found for this week - creating empty schedule');
          setTimetableId(null);
          setSchedule(emptySchedule);
          setLoading(false);
          return; // Exit the function early
        } else {
          // For other errors, rethrow to be caught by the outer catch block
          throw apiError;
        }
      }
      
      // We already defined emptySchedule earlier, so we don't need to recreate it here
      
      if (response.data && response.data.data) {
        // If a timetable was found, fill it with the data
        const timetableData = response.data.data as ApiTeacherTimetable;
        setTimetableId(timetableData.id);
        
        // Fill in the slots from the API data
        if (timetableData.slots && Array.isArray(timetableData.slots)) {
          console.log('Slots from API:', timetableData.slots); // Log the slots for debugging
          
          timetableData.slots.forEach(slot => {
            const dayIndex = days.findIndex(d => d.id === slot.day.toLowerCase());
            const slotIndex = timeSlots.findIndex(t => t.id === slot.slot_id);
            
            console.log(`Processing slot - Day: ${slot.day}, Slot ID: ${slot.slot_id}, Subject ID: ${slot.subject_id}`);
            console.log(`Day Index: ${dayIndex}, Slot Index: ${slotIndex}`);
            
            if (dayIndex !== -1 && slotIndex !== -1) {
              emptySchedule[dayIndex].slots[slotIndex] = slot.subject_id;
            }
          });
        }
        
        console.log('Final schedule after processing:', emptySchedule); // Log the final schedule
      } else {
        // No timetable found for this staff and week
        console.log('No timetable found - creating empty schedule');
        setTimetableId(null);
      }
      
      // Always set the schedule, whether we found a timetable or not
      setSchedule(emptySchedule);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Failed to load timetable data');
      setLoading(false);
      
      // Reset the schedule with empty slots on error
      setSchedule(days.map(day => ({
        ...day,
        slots: Array(timeSlots.length).fill(null),
      })));
    }
  };
  
  // Function to save the timetable to the backend
  const saveTimetable = async () => {
    if (!selectedStaff || !selectedWeek) {
      setError('Please select a staff and week');
      return;
    }
    
    try {
      setLoading(true);
      const weekStartDate = getWeekDates(selectedWeek)[0].toISOString().split('T')[0]; // Get Monday's date in YYYY-MM-DD format
      
      // Prepare slots data
      const slots: { day: string; time_slot: string; slot_id: string; is_break: boolean; subject_id: string | null; description: string | null }[] = [];
      
      schedule.forEach(day => {
        day.slots.forEach((subjectId, index) => {
          const timeSlot = timeSlots[index];
          if (timeSlot) {
            slots.push({
              day: day.id,
              time_slot: timeSlot.time,
              slot_id: timeSlot.id,
              is_break: timeSlot.isBreak || false,
              subject_id: subjectId,
              description: null // We could extend this to store the description from slotDetails if needed
            });
          }
        });
      });
      
      const timetableData = {
        staff_id: selectedStaff,
        week_start_date: weekStartDate,
        status: 'active',
        slots
      };
      
      let response;
      
      if (timetableId) {
        // Update existing timetable
        response = await axios.put(`${API_BASE}/teacher-timetables/${timetableId}`, timetableData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
      } else {
        // Create new timetable
        response = await axios.post(`${API_BASE}/teacher-timetables`, timetableData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        // Set the timetable ID from the response
        if (response.data && response.data.data && response.data.data.id) {
          setTimetableId(response.data.data.id);
        }
      }
      
      setLoading(false);
      alert('Timetable saved successfully');
      
      // Refresh the page after successful save
      window.location.reload();
    } catch (err) {
      console.error('Error saving timetable:', err);
      setError('Failed to save timetable data');
      setLoading(false);
      alert('Failed to save timetable. Please try again.');
    }
  };
  
  // We can remove the unused handleClassRemove function
  
  const handleEditClick = (dayId: string, slotId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const day = schedule.find(d => d.id === dayId);
    if (day) {
      const subjectId = day.slots[index] || '';
      setSlotDetails({ 
        subject: subjectId, 
        description: '' // We could fetch this from API if needed
      });
      setCurrentSlot({ dayId, slotId, index });
      setIsEditDialogOpen(true);
    }
  };
  
  const handleViewClick = (dayId: string, slotId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const day = schedule.find(d => d.id === dayId);
    if (day) {
      const subjectId = day.slots[index] || '';
      setSlotDetails({ 
        subject: subjectId, 
        description: '' // We could fetch this from API if needed
      });
      setCurrentSlot({ dayId, slotId, index });
      setIsViewDialogOpen(true);
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
  
  // Update days array to include dates
  const daysWithDates = days.map((day, index) => ({
    ...day,
    date: weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Teacher Timetable</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-1">
            Select Staff
          </label>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-1">
            Select Week
          </label>
          <Input
            type="week"
            id="week"
            value={getWeekValue(selectedWeek)}
            onChange={(e) => {
              const [year, week] = e.target.value.split('-W');
              const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
              // Adjust to the closest Monday
              const day = date.getDay();
              if (day !== 1) {
                date.setDate(date.getDate() + (day === 0 ? 1 : 8 - day));
              }
              setSelectedWeek(date);
            }}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={saveTimetable} 
          disabled={loading || !selectedStaff || !selectedWeek}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-blue-500 text-white shadow hover:bg-blue-500/90 h-9 px-4 py-2"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Timetable'
          )}
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timetable header */}
          <div className="grid grid-cols-[150px_repeat(7,1fr)] gap-2 mb-2">
            <div className="p-2 font-bold">Time Slot</div>
            {daysWithDates.map(day => (
              <div key={day.id} className="p-2 font-bold text-center">
                {day.day}
                <div className="text-xs font-normal">{day.date}</div>
              </div>
            ))}
          </div>
          
          {/* Timetable body */}
          <div className="grid grid-cols-[150px_repeat(7,1fr)] gap-2">
            {timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slot.id}>
                <div className="p-2 flex items-center">{slot.time}</div>
                {days.map(day => {
                  const dayObj = schedule.find(d => d.id === day.id);
                  const subjectId = dayObj ? dayObj.slots[slotIndex] : null;
                  // Add debugging to help track subject data
                  console.log(`Rendering day=${day.id} slot=${slotIndex} subjectId=${subjectId}`);
                  // Ensure consistent type comparison (convert to string if needed)
                  const subject = subjectId ? subjects.find(s => s.id === subjectId.toString()) : null;
                  if (subjectId && !subject) {
                    console.log(`Subject with ID ${subjectId} not found in subjects list:`, subjects);
                  }
                  
                  if (slot.isBreak || day.isHoliday) {
                    return (
                      <BreakSlot key={`${day.id}-${slot.id}`}>
                        {slot.isBreak ? 'Break' : 'Holiday'}
                      </BreakSlot>
                    );
                  }
                  
                  return (
                    <TimeSlotComponent
                      key={`${day.id}-${slot.id}`}
                      day={day}
                      slot={slot}
                      index={slotIndex}
                      onViewClick={handleViewClick}
                      onEditClick={handleEditClick}
                    >
                      {subject ? (
                        <div>
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-xs text-gray-500">
                            {/* You could display more details here if needed */}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {slot.time}
                        </span>
                      )}
                    </TimeSlotComponent>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
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
                    <SelectValue placeholder="Select a subject">
                      {slotDetails.subject && subjects.find(s => s.id === slotDetails.subject)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
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
                  subjects.find(s => s.id === slotDetails.subject)?.name || 'Not selected' : 
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

export default TeacherTimetable;
