import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calender.css';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Exam {
  date: Date;
  title: string;
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
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Use Promise.all to fetch all data types and combine them once all requests are complete
    const fetchAllData = async () => {
      try {
        const [examData, weeklyHolidayExams, holidayExams] = await Promise.all([
          fetchExams(),
          fetchWeeklyHolidays(),
          fetchHolidays()
        ]);
        
        // Combine all exam types into a single array
        const allExams = [
          ...(examData || []), 
          ...(weeklyHolidayExams || []), 
          ...(holidayExams || [])
        ];
        
        console.log(`Setting a total of ${allExams.length} exams to state`);
        setExams(allExams);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };
    
    fetchAllData();
  }, []);

 
  const fetchExams = async () => {
    try {
      // Fetch exams
      const examsResponse = await axios.get('/api/exams', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      const examsData = examsResponse.data.data.Exam || [];
      const formattedExams = examsData.map((exam: any) => ({
        date: new Date(exam.date),
        title: `Exam`,
        type: 'exam' as const,
        description: stripHtmlTags(exam.synopsis),
        time: exam.time
      }));

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
          <div className="exam-indicator">
            {dateExams.slice(0, 3).map((exam, index) => (
              exam.type !== 'weekly-holiday' && (
                <div 
                  key={index} 
                  className={exam.type === 'exam' ? 'exam-title' : 
                           exam.type === 'holiday' ? 'holiday-title' : 'exam-title'}
                  title={`${exam.title}${exam.description ? ` - ${exam.description}` : ''}`}
                >
                  {exam.time && <span className="exam-time">{formatExamTime(exam.time)}</span>}
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
      {selectedExams.length > 0 && (
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
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex w-full justify-start space-x-1">
              <TabsTrigger className="flex-1" value="all">All</TabsTrigger>
              <TabsTrigger className="flex-1" value="exams">Exams</TabsTrigger>
             </TabsList>
            <TabsContent value="all">
              {selectedExams
                .filter(exam => exam.type !== 'holiday')
                .map((exam, index) => (
                  <div 
                    key={index} 
                    className={`event-details ${exam.type}-details`}
                  >
                    <h4>{exam.title}</h4>
                    {exam.time && <p className="exam-time">{formatExamTime(exam.time)}</p>}
                    {exam.description && <p className="exam-description">{exam.description}</p>}
                  </div>
                ))}
            </TabsContent>
            <TabsContent value="exams">
              {renderExamsList('exam')}
            </TabsContent>
          
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;