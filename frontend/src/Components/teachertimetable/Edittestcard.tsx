import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from 'react-beautiful-dnd';
import { 
  Typography, 
  Box, 
  Paper, 
  FormControl, 
  IconButton
} from '@mui/material';
import { Eye, Edit } from 'lucide-react';
import { styled } from '@mui/material/styles';

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

const TimeSlot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  minHeight: 70,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const BreakSlot = styled(TimeSlot)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
}));

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
    { id: 'mon', day: 'Monday' },
    { id: 'tue', day: 'Tuesday' },
    { id: 'wed', day: 'Wednesday' },
    { id: 'thu', day: 'Thursday' },
    { id: 'fri', day: 'Friday' },
  ];

  // Initialize schedule with empty slots
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    days.map(day => ({
      ...day,
      slots: Array(timeSlots.length).fill(null),
    }))
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list or no change in position
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    const dayIndex = days.findIndex(day => day.id === destination.droppableId);
    if (dayIndex === -1) return;

    // Don't allow dropping on break time
    if (timeSlots[destination.index].isBreak) return;

    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const day = newSchedule.find(d => d.id === destination.droppableId);
      
      if (day) {
        const newSlots = [...day.slots];
        // Remove from source if it was dragged from another slot
        const sourceDayIndex = days.findIndex(d => d.id === source.droppableId);
        if (sourceDayIndex !== -1) {
          newSchedule[sourceDayIndex].slots[source.index] = null;
        }
        // Add to destination
        newSlots[destination.index] = draggableId;
        day.slots = newSlots;
      }
      
      return newSchedule;
    });
  };

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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Teacher's Weekly Schedule
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" color="textSecondary">
            Select Date:
          </Typography>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={formatDate(sixMonthsAgo)}
            max={formatDate(sixMonthsFromNow)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              fontFamily: 'Roboto, sans-serif',
              height: '40px',
              boxSizing: 'border-box'
            }}
          />
          <Typography variant="subtitle1" color="textSecondary" sx={{ ml: 2 }}>
            Select Staff:
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              style={{
                height: '40px',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
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
          </FormControl>
        </Box>
      </Box>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between' }}>
          {days.map(day => (
            <Box key={day.id} sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6">{day.day}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
            {days.map((day) => (
              <Droppable key={day.id} droppableId={day.id} isDropDisabled={false} isCombineEnabled={false}>
                {(provided: DroppableProvided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    {timeSlots.map((slot, index) => {
                      const classId = schedule.find(d => d.id === day.id)?.slots[index];
                      const classInfo = classes.find(c => c.id === classId);
                      
                      return (
                        <React.Fragment key={slot.id}>
                          {slot.isBreak ? (
                            <BreakSlot>
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 2, 
                                right: 2, 
                                display: 'flex',
                                zIndex: 1
                              }}>
                                <IconButton 
                                  size="small" 
                                  sx={{ p: 0.5 }}
                                  onClick={(e) => handleViewClick(day.id, slot.id, index, e)}
                                >
                                  <Eye size={16} />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  sx={{ p: 0.5 }}
                                  onClick={(e) => handleEditClick(day.id, slot.id, index, e)}
                                >
                                  <Edit size={16} />
                                </IconButton>
                              </Box>
                              <Typography variant="caption">Lunch Break</Typography>
                            </BreakSlot>
                          ) : (
                            <Droppable droppableId={`${day.id}-${slot.id}`} direction="horizontal" isDropDisabled={false} isCombineEnabled={false}>
                              {(provided: DroppableProvided) => (
                                <TimeSlot 
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  <Box sx={{ 
                                    position: 'absolute', 
                                    top: 2, 
                                    right: 2, 
                                    display: 'flex',
                                    zIndex: 1
                                  }}>
                                    <IconButton 
                                      size="small" 
                                      sx={{ p: 0.5 }}
                                      onClick={(e) => handleViewClick(day.id, slot.id, index, e)}
                                    >
                                      <Eye size={16} />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      sx={{ p: 0.5 }}
                                      onClick={(e) => handleEditClick(day.id, slot.id, index, e)}
                                    >
                                      <Edit size={16} />
                                    </IconButton>
                                  </Box>
                                  {classInfo ? (
                                    <Box
                                      sx={{
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        '&:hover': {
                                          opacity: 0.9,
                                        },
                                      }}
                                      onClick={() => handleClassRemove(day.id, index)}
                                    >
                                      {classInfo.name}
                                    </Box>
                                  ) : (
                                    <Typography variant="caption" color="textSecondary">
                                      {slot.time}
                                    </Typography>
                                  )}
                                  {provided.placeholder}
                                </TimeSlot>
                              )}
                            </Droppable>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            ))}
          </Box>
        </Box>
      </DragDropContext>
      
    
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
            <button 
              type="button" 
              onClick={handleSaveDetails}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              Save changes
            </button>
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
    </Box>
  );
};

export default Edittestcard;