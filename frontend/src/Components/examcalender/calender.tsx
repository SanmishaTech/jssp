import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calender.css';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import ExamDetailDialog from "./examdetaildialog";
import AddExamDialog, { ExamFormData } from "./addexamdialog";
import AlertDialogbox from "./AlertBox";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export interface Supervisor {
  id: number;
  staff_name: string;
  role?: string;
}

export interface Exam {
  date: Date;
  title: string;
  id?: number;
  exam_id_name?: string;
  exam_code?: string;
  course?: string;
  duration_minutes?: number;
  supervisors?: Supervisor[];
  staff_id?: number[];
  type: 'exam' | 'weekly-holiday' | 'holiday';
  description?: string;
  time?: string;
  endDate?: Date; // For multi-day holidays
}

interface CalendarProps {
  exams?: Exam[];
}

interface Holiday {
  id: string;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
}

interface WeeklyHoliday {
  day_of_week: number; // 0 for Sunday, 1 for Monday, etc.
  is_active: boolean;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarComponent: React.FC<CalendarProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedExams, setSelectedExams] = useState<Exam[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday[]>([]);
  const [detailsExam, setDetailsExam] = useState<Exam | null>(null);
  const [allExams, setAllExams] = useState<{id:number; exam_title:string}[]>([]);
  const [allSubjects, setAllSubjects] = useState<{id:number; subject_name:string}[]>([]);
  const [allStaff, setAllStaff] = useState<Supervisor[]>([]);
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState<number | undefined>();
  const [examToEdit, setExamToEdit] = useState<ExamFormData | undefined>();
  const token = localStorage.getItem("token");

  useEffect(() => {
    refreshCalendar();
    fetchAllExams();
    fetchAllSubjects();
  }, []);

 
  // Fetch staff list for supervisor selection
  const fetchAllExams = async () => {
    try {
      const res = await axios.get('/api/all_exams', { headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }});
      const list = res.data.data.Exam || [];
      setAllExams(list.map((e:any)=>({id:e.id, exam_title:e.exam_title})));
    }catch(err){console.error('error fetching all exams', err);}  
  };

  const fetchAllSubjects = async () => {
    try {
      const res = await axios.get('/api/all_subjects', { headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }});
      const list = res.data.data.Subject || [];
      setAllSubjects(list.map((s:any)=>({id:s.id, subject_name:s.subject_name})));
    }catch(err){console.error('error fetch subjects', err);}  
  };

  const fetchAllStaff = async (): Promise<Supervisor[]> => {
    try {
      const res = await axios.get('/api/all_staff', { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
      const staffData: Supervisor[] = (res.data.data.Staff || []).map((s: any) => ({
        id: s.id,
        staff_name: s.name,
        role: s.role,
      }));
      setAllStaff(staffData);
      return staffData;
    } catch(err){
      console.error('error fetching staff', err);
      return [];
    }
  };

  const fetchExams = async (staffList: Supervisor[]) => {
    try {
      // Fetch exams
      const examsResponse = await axios.get('/api/exam-calendars', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      const examsData = examsResponse.data.data.ExamCalendar || [];
      const formattedExams = examsData.map((exam: any) => {
        const supervisors = (exam.staff_id || []).map((staffId: string) => {
          const staffMember = staffList.find(s => s.id.toString() === staffId);
          return staffMember || { id: parseInt(staffId), staff_name: `Unknown Staff (ID: ${staffId})` };
        });

        return {
          date: new Date(exam.date),
          title: exam.exam_name || 'Exam',
          exam_id_name: exam.exam_id_name,
          type: 'exam' as const,
          description: stripHtmlTags(exam.description),
          time: exam.exam_time,
          id: exam.id,
          exam_code: exam.exam_code,
          course: exam.course,
          duration_minutes: exam.duration_minutes,
          supervisors: supervisors,
          staff_id: (exam.staff_id || []).map((id: string) => parseInt(id, 10))
        };
      });

      console.log(`Fetched ${formattedExams.length} exams`);
      return formattedExams;
    } catch (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
  };

  // Utility function to strip HTML tags from a string
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // Function to fetch holidays from the all_holiday endpoint
  const fetchHolidays = async () => {
    try {
      const response = await axios.get('/api/all_holiday', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Holidays API response:', response.data);
      
      if (response.data?.status === true && response.data?.data?.Holiday) {
        const holidaysData: Holiday[] = response.data.data.Holiday;
        
        // Create holiday exams for each date in the range
        const holidayExams: Exam[] = [];
        
        holidaysData.forEach((holiday: Holiday) => {
          const fromDate = new Date(holiday.from_date);
          const toDate = new Date(holiday.to_date);
          
          // For single day holidays
          if (fromDate.toDateString() === toDate.toDateString()) {
            holidayExams.push({
              date: fromDate,
              title: holiday.title,
              type: 'holiday',
              description: holiday.description
            });
          } else {
            // For multi-day holidays
            // First add an exam for the start date with endDate property
            holidayExams.push({
              date: fromDate,
              endDate: toDate,
              title: holiday.title,
              type: 'holiday',
              description: holiday.description
            });
            
            // Then add individual day entries for highlighting in the calendar
            const currentDate = new Date(fromDate);
            currentDate.setDate(currentDate.getDate() + 1); // Start from the day after fromDate
            
            while (currentDate <= toDate) {
              holidayExams.push({
                date: new Date(currentDate),
                title: holiday.title,
                type: 'holiday',
                description: holiday.description
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });
        
        console.log(`Generated ${holidayExams.length} holiday exams`);
        return holidayExams;
      }
      return [];
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }
  };

  const fetchWeeklyHolidays = async () => {
    try {
      // Fetch weekly holidays using the correct endpoint
      const response = await axios.get('/api/weekly-holidays', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Debugging: Log raw response
      console.log('Weekly holidays API response:', response.data);
      
      let weeklyHolidaysList: WeeklyHoliday[] = [];
      
      const weeklyHoliday = response.data?.data?.WeeklyHoliday;
      
      // Consider the weekly holiday configuration "active" unless the API explicitly marks it as inactive (false).
      const isActive = weeklyHoliday && weeklyHoliday.is_active !== false; // Treat true or null/undefined as active
      
      if (response.data?.status === true && weeklyHoliday && isActive) {
        
        console.log('Found weekly holiday config:', weeklyHoliday);
        
        // Check if holiday_days array exists
        if (Array.isArray(weeklyHoliday.holiday_days)) {
          // For each day in the holiday_days array, create a WeeklyHoliday object
          weeklyHoliday.holiday_days.forEach((day: number) => {
            weeklyHolidaysList.push({
              day_of_week: day,
              is_active: true
            });
          });
          
          console.log('Extracted holiday days:', weeklyHoliday.holiday_days);
          console.log('Created weekly holidays list:', weeklyHolidaysList);
        }
      } else {
        console.warn('API response format unexpected or holiday is not active');
      }
      
      // If we couldn't parse any weekly holidays, add default ones for testing
      if (weeklyHolidaysList.length === 0) {
        console.warn('No weekly holidays found in API response, adding default ones for testing');
        weeklyHolidaysList = [
          { day_of_week: 0, is_active: true },  // Sunday
         ];
      }
      
      setWeeklyHolidays(weeklyHolidaysList);
      console.log('Final parsed weekly holidays:', weeklyHolidaysList);
      
      // Generate weekly holiday exams for the calendar
      return generateWeeklyHolidayExams(weeklyHolidaysList);
    } catch (error) {
      console.error('Error fetching weekly holidays:', error);
      // Even if API fails, add some default weekly holidays for testing
      const defaultHolidays = [
        { day_of_week: 0, is_active: true },  // Sunday
       ];
      setWeeklyHolidays(defaultHolidays);
      return generateWeeklyHolidayExams(defaultHolidays);
    }
  };
  
  const generateWeeklyHolidayExams = (activeWeeklyHolidays: WeeklyHoliday[]) => {
    if (activeWeeklyHolidays.length === 0) {
      console.log('No weekly holidays found');
      return [];
    }
    
    console.log('Generating weekly holiday exams for:', activeWeeklyHolidays);
    
    const weeklyHolidayExams: Exam[] = [];
    const today = new Date();
    
    // Start from beginning of current month for better visibility
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Generate for 6 months to ensure visibility
    const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, 0);
    
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0); // Reset time part
    
    console.log(`Generating weekly holidays from ${startDate.toDateString()} to ${sixMonthsLater.toDateString()}`);
    
    // Set to keep track of dates to avoid duplicates
    const processedDates = new Set<string>();
    
    while (currentDate <= sixMonthsLater) {
      const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
      const dateString = currentDate.toDateString();
      
      // Check if this day of week is a weekly holiday
      const matchingHoliday = activeWeeklyHolidays.find(wh => wh.day_of_week === dayOfWeek);
      
      if (matchingHoliday && !processedDates.has(dateString)) {
        processedDates.add(dateString);
        const weekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentDate);
        
        console.log(`Adding weekly holiday for ${dateString} (${weekdayName})`);
        
        weeklyHolidayExams.push({
          date: new Date(currentDate),
          title: `${weekdayName} Holiday`,
          type: 'weekly-holiday',
          description: `Weekly holiday on ${weekdayName}`
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Generated ${weeklyHolidayExams.length} weekly holiday exams`);
    
    if (weeklyHolidayExams.length > 0) {
      // Log a few sample dates for verification
      console.log('Sample weekly holiday dates:', 
                 weeklyHolidayExams.slice(0, 5).map(e => e.date.toDateString()));
    } else {
      console.warn('No weekly holiday exams were generated!');
    }
    
    return weeklyHolidayExams;
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      const examsOnDay = exams.filter(
        exam => exam.date.toDateString() === value.toDateString()
      );
      setSelectedExams(examsOnDay);
    }
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      // For debugging purposes, log the first day of each month when rendering
      if (date.getDate() === 1) {
        console.log(`Rendering month view for ${date.toDateString()}, weekly holidays:`, weeklyHolidays);
      }
      
      // Check for weekly holiday by day of week
      const dayOfWeek = date.getDay();
      
      // For every Sunday (as an example), log the check
      if (dayOfWeek === 0) {
        const matchingHoliday = weeklyHolidays.find(wh => wh.day_of_week === dayOfWeek);
        console.log(`Checking ${date.toDateString()} (day ${dayOfWeek}):`, 
                   matchingHoliday ? 'IS a weekly holiday' : 'is NOT a weekly holiday');
      }
      
      const isWeeklyHoliday = weeklyHolidays.some(wh => wh.day_of_week === dayOfWeek && wh.is_active);
      
       const dateExams = exams.filter(
        exam => exam.date.toDateString() === date.toDateString()
      );
      
      const hasExam = dateExams.some(exam => exam.type === 'exam');
      
      const hasWeeklyHolidayExam = dateExams.some(exam => exam.type === 'weekly-holiday');
      const hasHoliday = dateExams.some(exam => exam.type === 'holiday');

      // Check for holiday first (highest priority)
      if (hasHoliday) {
        return 'has-holiday holiday-tile';
      }
      
      // Log when we find a day that should be styled as a weekly holiday
      if (isWeeklyHoliday || hasWeeklyHolidayExam) {
        console.log(`Applying weekly-holiday class to ${date.toDateString()}, ` + 
                   `isWeeklyHoliday: ${isWeeklyHoliday}, hasWeeklyHolidayExam: ${hasWeeklyHolidayExam}`);
        return 'has-weekly-holiday holiday-tile';
      }
      
      if (hasExam) return 'has-exam';
    }
    return '';
  };

  const formatExamTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const refreshCalendar = async () => {
    try {
      const staffList = await fetchAllStaff();
      const [examData, weeklyHolidayExams, holidayExams] = await Promise.all([
        fetchExams(staffList),
        fetchWeeklyHolidays(),
        fetchHolidays()
      ]);
      const allCombinedExams = [
        ...(examData || []), 
        ...(weeklyHolidayExams || []), 
        ...(holidayExams || [])
      ];
      setExams(allCombinedExams);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const handleDelete = (examId?: number) => {
    if (examId) {
      setDeleteExamId(examId);
      setIsAlertOpen(true);
    }
  };

  const openDetailsDialog = (exam: Exam) => {
    setDetailsExam(exam);
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateExams = exams.filter(
        exam => exam.date.toDateString() === date.toDateString()
      );
      
      const dayOfWeek = date.getDay();
      const isWeeklyHoliday = weeklyHolidays.some(wh => wh.day_of_week === dayOfWeek && wh.is_active);
      const hasHoliday = dateExams.some(exam => exam.type === 'holiday');
      
      return (
        <>
          {isWeeklyHoliday && !hasHoliday && (
            <div className="holiday-indicator">W</div>
          )}
          {hasHoliday && (
            <div className="holiday-indicator">H</div>
          )}
          <div className="exam-indicator relative">
            {dateExams.slice(0, 3).map((exam, index) => (
              exam.type !== 'weekly-holiday' && (
                <div 
                  key={index} 
                  className={exam.type === 'exam' ? 'exam-title' : 
                           exam.type === 'holiday' ? 'holiday-title' : 'exam-title'}
                  title={`${exam.title}${exam.description ? ` - ${exam.description}` : ''}`}
                >
                  
                  {exam.title}
                  {exam.endDate && <span> (until {exam.endDate.toLocaleDateString()})</span>}
                </div>
              )
            ))}
            {dateExams.length > 3 && (
              <div className="exam-title more-exams">
                +{dateExams.length - 3} more
              </div>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  const renderExamsList = (type: 'exam' | 'weekly-holiday' | 'holiday') => {
    const filteredExams = selectedExams.filter(exam => exam.type === type);
    if (filteredExams.length === 0) return <p className="text-muted-foreground text-sm">No {type === 'weekly-holiday' ? 'weekly holidays' : type + 's'} scheduled for this day.</p>;
    
    return filteredExams.map((exam, index) => (
      <div 
        key={index} 
        className={`event-details ${exam.type}-details`}
      >
        <h4>{exam.title}</h4>
        {exam.time && <p className="exam-time">{formatExamTime(exam.time)}</p>}
        {exam.description && <p className="exam-description">{exam.description}</p>}
      </div>
    ));
  };



  return (
    <div className="calendar-wrapper">
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={getTileClassName}
          tileContent={getTileContent}
          view="month"
          showNeighboringMonth={true}
          minDetail="month"
          maxDetail="month"
          formatShortWeekday={(locale, date) => 
            date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 3)
          }
        />
      </div>
      {/* Details container, always visible */}
      <div className="selected-date-events">
        <h3>Details for {selectedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</h3>

        {/* Show holidays first */}
        {selectedExams.some(e => e.type === 'holiday') && (
          <div className="holiday-section">
            <h4>Holidays</h4>
            {renderExamsList('holiday')}
          </div>
        )}

        <Button variant="secondary" size="sm" className="mb-2 flex items-center gap-2 w-full" onClick={() => setIsAddExamDialogOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Add Exam
        </Button>
        <AddExamDialog
          open={isAddExamDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setExamToEdit(undefined); // Reset on close
            }
            setIsAddExamDialogOpen(isOpen);
          }}
          allExams={allExams}
          allSubjects={allSubjects}
          allStaff={allStaff}
          fetchData={refreshCalendar}
          examToEdit={examToEdit}
          selectedDate={selectedDate}
        />
        <h4 className="mt-4 mb-2 font-semibold">Exam List</h4>
        {selectedExams.filter(exam => exam.type !== 'holiday').length > 0 ? (
          <TooltipProvider>
            {selectedExams.filter(exam => exam.type !== 'holiday').map((exam, index) => (
              <div
                key={index}
                className={`event-details ${exam.type}-details flex justify-between items-center`}
              >
                <div className="flex-grow cursor-pointer" onClick={() => openDetailsDialog(exam)}>
                  <h4>{exam.title}</h4>
                  {exam.time && <p className="exam-time">{formatExamTime(exam.time)}</p>}
                  {exam.description && <p className="exam-description">{exam.description}</p>}
                </div>
                <div className="flex items-center">

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Exam</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </TooltipProvider>
        ) : (
          <p className="text-muted-foreground text-sm">No exams scheduled for this day.</p>
        )}
        {/* Details Exam Dialog using separate component */}
        {detailsExam && (
          <ExamDetailDialog
          exam={detailsExam}
          onClose={() => setDetailsExam(null)}
          allStaff={allStaff}
        />
        )}
      </div>
      <AlertDialogbox
        isOpen={isAlertOpen}
        onOpen={() => setIsAlertOpen(!isAlertOpen)}
        url={`exam-calendars/${deleteExamId}`}
        fetchData={refreshCalendar}
      />
    </div>
  );
};

export default CalendarComponent;