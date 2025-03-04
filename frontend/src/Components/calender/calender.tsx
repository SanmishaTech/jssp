import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calender.css';

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

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarComponent: React.FC<CalendarProps> = ({ events = [] }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

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
                className={`event-title ${event.type === 'meeting' ? 'meeting-title' : ''}`}
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
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;