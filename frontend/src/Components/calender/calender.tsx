import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calender.css';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  date: Date;
  title: string;
  type: 'event' | 'meeting';
  description?: string;
  time?: string;
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

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarComponent: React.FC<CalendarProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMeetingsAndEvents();
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
      
      const meetingsData: Meeting[] = meetingsResponse.data.data.Meeting;
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
      
      const eventsData: Meeting[] = eventsResponse.data.data.Event;
      const formattedEvents = eventsData.map((event: Meeting) => ({
        date: new Date(event.date),
        title: `Event at ${event.venue}`,
        type: 'event' as const,
        description: event.synopsis,
        time: event.time
      }));

      // Combine both meetings and events
      setEvents([...formattedMeetings, ...formattedEvents]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
      const dateEvents = events.filter(
        event => event.date.toDateString() === date.toDateString()
      );
      
      const hasEvent = dateEvents.some(event => event.type === 'event');
      const hasMeeting = dateEvents.some(event => event.type === 'meeting');

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
      
      if (dateEvents.length > 0) {
        return (
          <div className="event-indicator">
            {dateEvents.slice(0, 3).map((event, index) => (
              <div 
                key={index} 
                className={event.type === 'event' ? 'event-title' : 'meeting-title'}
                title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
              >
                {event.time && <span className="event-time">{formatEventTime(event.time)}</span>}
                {event.title}
              </div>
            ))}
            {dateEvents.length > 3 && (
              <div className="event-title more-events">
                +{dateEvents.length - 3} more
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const renderEventsList = (type: 'event' | 'meeting') => {
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
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {selectedEvents.map((event, index) => (
                <div 
                  key={index} 
                  className={`event-details ${event.type}-details`}
                >
                  <h4>{event.title}</h4>
                  {event.time && <p className="event-time">{formatEventTime(event.time)}</p>}
                  {event.description && <p className="event-description">{event.description}</p>}
                </div>
              ))}
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