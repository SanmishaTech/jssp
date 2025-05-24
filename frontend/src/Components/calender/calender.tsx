import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calender.css';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  date: Date;
  title: string;
  type: 'event' | 'meeting' | 'weekly-holiday' | 'holiday';
  description?: string;
  time?: string;
  endDate?: Date; // For multi-day holidays
}

interface CalendarProps {
  events?: Event[];
}

interface Meeting {
  id: string;
  venue: string;
  date: string;
  time: string;
  synopsis: string;
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
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Use Promise.all to fetch all data types and combine them once all requests are complete
    const fetchAllData = async () => {
      try {
        const [meetingsAndEvents, weeklyHolidayEvents, holidayEvents] = await Promise.all([
          fetchMeetingsAndEvents(),
          fetchWeeklyHolidays(),
          fetchHolidays()
        ]);
        
        // Combine all event types into a single array
        const allEvents = [
          ...(meetingsAndEvents || []), 
          ...(weeklyHolidayEvents || []), 
          ...(holidayEvents || [])
        ];
        
        console.log(`Setting a total of ${allEvents.length} events to state`);
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };
    
    fetchAllData();
  }, []);

  const fetchMeetingsAndEvents = async () => {
    try {
      // Fetch meetings
      const meetingsResponse = await axios.get('/api/meetings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      const meetingsData: Meeting[] = meetingsResponse.data.data.Meeting || [];
      const formattedMeetings = meetingsData.map((meeting: Meeting) => ({
        date: new Date(meeting.date),
        title: `Meeting at ${meeting.venue}`,
        type: 'meeting' as const,
        description: meeting.synopsis,
        time: meeting.time
      }));

      // Fetch events
      const eventsResponse = await axios.get('/api/events', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      const eventsData: Meeting[] = eventsResponse.data.data.Event || [];
      const formattedEvents = eventsData.map((event: Meeting) => ({
        date: new Date(event.date),
        title: `Event at ${event.venue}`,
        type: 'event' as const,
        description: event.synopsis,
        time: event.time
      }));

      console.log(`Fetched ${formattedMeetings.length} meetings and ${formattedEvents.length} events`);
      
      // Return the combined array instead of setting state
      return [...formattedMeetings, ...formattedEvents];
    } catch (error) {
      console.error('Error fetching meetings and events:', error);
      return [];
    }
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
        
        // Create holiday events for each date in the range
        const holidayEvents: Event[] = [];
        
        holidaysData.forEach((holiday: Holiday) => {
          const fromDate = new Date(holiday.from_date);
          const toDate = new Date(holiday.to_date);
          
          // For single day holidays
          if (fromDate.toDateString() === toDate.toDateString()) {
            holidayEvents.push({
              date: fromDate,
              title: holiday.title,
              type: 'holiday',
              description: holiday.description
            });
          } else {
            // For multi-day holidays
            // First add an event for the start date with endDate property
            holidayEvents.push({
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
              holidayEvents.push({
                date: new Date(currentDate),
                title: holiday.title,
                type: 'holiday',
                description: holiday.description
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });
        
        console.log(`Generated ${holidayEvents.length} holiday events`);
        return holidayEvents;
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
      
      // Handle the specific format from the API:
      // {
      //   "status": true,
      //   "message": "Weekly holidays retrieved successfully",
      //   "data": {
      //       "WeeklyHoliday": {
      //           "id": 2,
      //           "institute_id": 2,
      //           "holiday_days": [2, 6],
      //           "holiday_days_names": ["Tuesday", "Saturday"],
      //           "description": "Weekly Holiday",
      //           "is_active": true,
      //           "created_at": "2025-05-24T07:01:01.000000Z",
      //           "updated_at": "2025-05-24T07:08:10.000000Z"
      //       }
      //   }
      // }
      
      if (response.data?.status === true && 
          response.data?.data?.WeeklyHoliday && 
          response.data.data.WeeklyHoliday.is_active) {
        
        const weeklyHoliday = response.data.data.WeeklyHoliday;
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
          { day_of_week: 6, is_active: true }   // Saturday
        ];
      }
      
      setWeeklyHolidays(weeklyHolidaysList);
      console.log('Final parsed weekly holidays:', weeklyHolidaysList);
      
      // Generate weekly holiday events for the calendar
      return generateWeeklyHolidayEvents(weeklyHolidaysList);
    } catch (error) {
      console.error('Error fetching weekly holidays:', error);
      // Even if API fails, add some default weekly holidays for testing
      const defaultHolidays = [
        { day_of_week: 0, is_active: true },  // Sunday
        { day_of_week: 6, is_active: true }   // Saturday
      ];
      setWeeklyHolidays(defaultHolidays);
      return generateWeeklyHolidayEvents(defaultHolidays);
    }
  };
  
  const generateWeeklyHolidayEvents = (activeWeeklyHolidays: WeeklyHoliday[]) => {
    if (activeWeeklyHolidays.length === 0) {
      console.log('No weekly holidays found');
      return [];
    }
    
    console.log('Generating weekly holiday events for:', activeWeeklyHolidays);
    
    const weeklyHolidayEvents: Event[] = [];
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
        
        weeklyHolidayEvents.push({
          date: new Date(currentDate),
          title: `${weekdayName} Holiday`,
          type: 'weekly-holiday',
          description: `Weekly holiday on ${weekdayName}`
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Generated ${weeklyHolidayEvents.length} weekly holiday events`);
    
    if (weeklyHolidayEvents.length > 0) {
      // Log a few sample dates for verification
      console.log('Sample weekly holiday dates:', 
                 weeklyHolidayEvents.slice(0, 5).map(e => e.date.toDateString()));
    } else {
      console.warn('No weekly holiday events were generated!');
    }
    
    return weeklyHolidayEvents;
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      const eventsOnDay = events.filter(
        event => event.date.toDateString() === value.toDateString()
      );
      setSelectedEvents(eventsOnDay);
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
      
      // Check for events and meetings
      const dateEvents = events.filter(
        event => event.date.toDateString() === date.toDateString()
      );
      
      const hasEvent = dateEvents.some(event => event.type === 'event');
      const hasMeeting = dateEvents.some(event => event.type === 'meeting');
      const hasWeeklyHolidayEvent = dateEvents.some(event => event.type === 'weekly-holiday');
      const hasHoliday = dateEvents.some(event => event.type === 'holiday');

      // Check for holiday first (highest priority)
      if (hasHoliday) {
        return 'has-holiday holiday-tile';
      }
      
      // Log when we find a day that should be styled as a weekly holiday
      if (isWeeklyHoliday || hasWeeklyHolidayEvent) {
        console.log(`Applying weekly-holiday class to ${date.toDateString()}, ` + 
                   `isWeeklyHoliday: ${isWeeklyHoliday}, hasWeeklyHolidayEvent: ${hasWeeklyHolidayEvent}`);
        return 'has-weekly-holiday holiday-tile';
      }
      
      if (hasEvent && hasMeeting) return 'has-event-and-meeting';
      if (hasEvent) return 'has-event';
      if (hasMeeting) return 'has-meeting';
    }
    return '';
  };

  const formatEventTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateEvents = events.filter(
        event => event.date.toDateString() === date.toDateString()
      );
      
      const dayOfWeek = date.getDay();
      const isWeeklyHoliday = weeklyHolidays.some(wh => wh.day_of_week === dayOfWeek && wh.is_active);
      const hasHoliday = dateEvents.some(event => event.type === 'holiday');
      
      return (
        <>
          {isWeeklyHoliday && !hasHoliday && (
            <div className="holiday-indicator">W</div>
          )}
          {hasHoliday && (
            <div className="holiday-indicator">H</div>
          )}
          <div className="event-indicator">
            {dateEvents.slice(0, 3).map((event, index) => (
              event.type !== 'weekly-holiday' && (
                <div 
                  key={index} 
                  className={event.type === 'event' ? 'event-title' : 
                           event.type === 'meeting' ? 'meeting-title' : 
                           event.type === 'holiday' ? 'holiday-title' : 'meeting-title'}
                  title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
                >
                  {event.time && <span className="event-time">{formatEventTime(event.time)}</span>}
                  {event.title}
                  {event.endDate && <span> (until {event.endDate.toLocaleDateString()})</span>}
                </div>
              )
            ))}
            {dateEvents.length > 3 && (
              <div className="event-title more-events">
                +{dateEvents.length - 3} more
              </div>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  const renderEventsList = (type: 'event' | 'meeting' | 'weekly-holiday' | 'holiday') => {
    const filteredEvents = selectedEvents.filter(event => event.type === type);
    if (filteredEvents.length === 0) return <p className="text-muted-foreground text-sm">No {type}s scheduled for this day.</p>;
    
    return filteredEvents.map((event, index) => (
      <div 
        key={index} 
        className={`event-details ${event.type}-details`}
      >
        <h4>{event.title}</h4>
        {event.time && <p className="event-time">{formatEventTime(event.time)}</p>}
        {event.description && <p className="event-description">{event.description}</p>}
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
      {selectedEvents.length > 0 && (
        <div className="selected-date-events">
          <h3>Events for {selectedDate.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</h3>
          
          {/* Show holidays first */}
          {selectedEvents.some(e => e.type === 'holiday') && (
            <div className="holiday-section">
              <h4>Holidays</h4>
              {renderEventsList('holiday')}
            </div>
          )}
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex w-full justify-start space-x-1">
              <TabsTrigger className="flex-1" value="all">All</TabsTrigger>
              <TabsTrigger className="flex-1" value="events">Events</TabsTrigger>
              <TabsTrigger className="flex-1" value="meetings">Meetings</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {selectedEvents
                .filter(event => event.type !== 'holiday')
                .map((event, index) => (
                  <div 
                    key={index} 
                    className={`event-details ${event.type}-details`}
                  >
                    <h4>{event.title}</h4>
                    {event.time && <p className="event-time">{formatEventTime(event.time)}</p>}
                    {event.description && <p className="event-description">{event.description}</p>}
                  </div>
                ))
              }
            </TabsContent>
            <TabsContent value="events">
              {renderEventsList('event')}
            </TabsContent>
            <TabsContent value="meetings">
              {renderEventsList('meeting')}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;