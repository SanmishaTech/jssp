import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Loader2, Users, Info, FileDown, Download } from 'lucide-react';

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
  division_id: string | null;
  subject?: {
    id: string;
    subject_name: string;
  };
  division?: {
    id: string;
    division_name: string;
  };
};

type SlotData = {
  subject_id: string | null;
  division_id: string | null;
};

type DaySchedule = {
  id: string;
  day: string;
  slots: SlotData[];
  isHoliday?: boolean;
  holidayInfo?: {
    title: string;
    description?: string;
  };
};

type SlotProps = {
  children: React.ReactNode;
  day: { 
    id: string;
    isHoliday?: boolean;
    holidayInfo?: {
      title: string;
      description?: string;
    };
  };
  date?: string;
  slot: { id: string; time?: string };
  index: number;
  division_id?: string | null;
  subject_id?: string | null;
  time_slot?: string | null;
  onEditClick: (dayId: string, slotId: string, index: number, e: React.MouseEvent) => void;
  subjectName?: string;
  divisionName?: string;
};

// UI Components
const TimeSlotComponent: React.FC<SlotProps> = ({ children, day, slot, index, division_id, subject_id, time_slot, date, onEditClick, subjectName, divisionName }) => {
  // Check if the day is a holiday or has holiday info
  const isHoliday = day.isHoliday;
  const holidayInfo = day.holidayInfo;
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{total: number, present: number, absent: number} | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Function to fetch attendance data for this slot
  const fetchAttendanceData = async () => {
    if (!division_id || !date || !time_slot || !subject_id) {
      setAttendanceData(null);
      return;
    }
    
    setIsLoadingAttendance(true);
    try {
      // Using the statistics endpoint for attendance data
      const response = await axios.post(
        '/api/attendance/by-date-division', 
        {
          division_id,
          date,
          subject_id,
          time_slot
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      
      if (response.data && response.data.status) {
        // Parse the attendance data from response
        const attendanceRecords = response.data.data || [];
        const totalStudents = attendanceRecords.length;
        const presentStudents = attendanceRecords.filter((record: any) => record.status === 'present').length;
        
        setAttendanceData({
          total: totalStudents,
          present: presentStudents,
          absent: totalStudents - presentStudents
        });
      } else {
        setAttendanceData({ total: 0, present: 0, absent: 0 });
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData({ total: 0, present: 0, absent: 0 });
    } finally {
      setIsLoadingAttendance(false);
    }
  };
  
  return (
    <Card 
      className={`p-2 text-center min-h-[100px] max-h-[150px] w-full max-w-full flex items-center justify-center relative ${isHoliday ? 'bg-red-100' : ''}`}
    >
      {isHoliday && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs py-1 font-semibold truncate">
          {holidayInfo ? holidayInfo.title : 'Weekly Holiday'}
        </div>
      )}
      {!isHoliday && (
        <div className="absolute top-1 right-1 flex gap-1">
          {division_id && date && subject_id && (
            <a 
              href={`/attendence?division_id=${division_id}&date=${date}&time_slot=${encodeURIComponent(time_slot || '')}&subject_id=${subject_id || ''}&slot_id=${slot.id}`}
              className="h-6 w-6 p-0 flex items-center justify-center"
              title="Take Attendance for this Lecture"
              onClick={(e) => e.stopPropagation()}
            >
              <Users className="h-4 w-4 text-blue-500 hover:text-blue-700" />
            </a>
          )}
          {window.localStorage.getItem('role') === 'admin' && ( 
            <>
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInfoDialogOpen(true);
                  fetchAttendanceData();
                }}
              >
                <Info className="h-4 w-4 text-blue-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportDialogOpen(true);
                }}
              >
                <FileDown className="h-4 w-4 text-green-500" />
              </Button>
            </>
          )}
        </div>
      )}
      {children}
      
      {/* Info Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Slot Information</DialogTitle>
            <DialogDescription>
              Detailed information about this time slot.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Day:</span>
              <div className="col-span-3">
                {day.id ? day.id.split('-')[0] : 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Date:</span>
              <div className="col-span-3">
                {date ? new Date(date).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Time:</span>
              <div className="col-span-3">
                {slot.time || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Subject:</span>
              <div className="col-span-3">
                {subject_id ? (subjectName || 'Subject ID: ' + subject_id) : 'Not assigned'}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Division:</span>
              <div className="col-span-3">
                {division_id ? (divisionName || 'Division ID: ' + division_id) : 'Not assigned'}
              </div>
            </div>
            
            
            
            {isHoliday && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-medium">Holiday:</span>
                <div className="col-span-3 text-red-500">
                  {holidayInfo ? holidayInfo.title : 'Weekly Holiday'}
                  {holidayInfo?.description && (
                    <p className="text-sm text-gray-500">{holidayInfo.description}</p>
                  )}
                </div>
              </div>
            )}

            {subject_id && division_id && date && (
              <div className="grid grid-cols-1 gap-2 mt-2">
                <a 
                  href={`/attendence?division_id=${division_id}&date=${date}&time_slot=${encodeURIComponent(time_slot || '')}&subject_id=${subject_id || ''}&slot_id=${slot.id}`}
                  className="w-full p-2 bg-blue-100 text-blue-800 rounded-md text-center text-sm font-medium hover:bg-blue-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Attendance
                </a>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setIsInfoDialogOpen(false)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-blue-500 text-white shadow hover:bg-blue-500/90 h-9 px-4 py-2"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Report Download Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Download Attendance Report</DialogTitle>
            <DialogDescription>
              {date && <span>Date: {new Date(date).toLocaleDateString()}</span>}
              {subjectName && <span> • Subject: {subjectName}</span>}
              {divisionName && <span> • Division: {divisionName}</span>}
            </DialogDescription>
          </DialogHeader>
          
          <AttendanceReportDownloadOptions 
            division_id={division_id || ''} 
            initialDate={date || ''} 
            onClose={() => setIsReportDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
    </Card>
  );
};

const BreakSlot = ({ children }: { children: React.ReactNode }) => (
  <Card className="p-2 text-center min-h-[100px] max-h-[150px] w-full max-w-full flex items-center justify-center bg-gray-200 text-gray-500 italic overflow-hidden">
    <div className="truncate">{children}</div>
  </Card>
);

// Attendance Report Download Options Component
const AttendanceReportDownloadOptions: React.FC<{
  division_id: string;
  initialDate: string;
  onClose: () => void;
}> = ({ division_id, initialDate, onClose }) => {
  const token = localStorage.getItem('token');
  const [reportType, setReportType] = useState<'day' | 'week' | 'month'>('day');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [loading, setLoading] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    start_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
    end_date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const handleDownloadReport = async () => {
    if (!division_id) {
      alert("Division ID is required");
      return;
    }
    
    let endpoint = '';
    let requestData: any = {
      division_id,
      format
    };
    
    // Set up endpoint and request data based on report type
    if (reportType === 'day') {
      endpoint = '/api/attendance/reports/day';
      requestData.date = reportOptions.date;
    } else if (reportType === 'week') {
      endpoint = '/api/attendance/reports/week';
      requestData.start_date = reportOptions.start_date;
      requestData.end_date = reportOptions.end_date;
    } else if (reportType === 'month') {
      endpoint = '/api/attendance/reports/month';
      requestData.month = reportOptions.month;
      requestData.year = reportOptions.year;
    }
    
    try {
      setLoading(true);
      const response = await axios({
        method: 'post',
        url: endpoint,
        responseType: 'blob',
        data: requestData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate appropriate filename
      let filename = `attendance_report_${division_id}`;
      if (reportType === 'day') {
        filename += `_${reportOptions.date}`;
      } else if (reportType === 'week') {
        filename += `_week_${reportOptions.start_date}_to_${reportOptions.end_date}`;
      } else if (reportType === 'month') {
        const monthName = new Date(reportOptions.year, reportOptions.month - 1).toLocaleString('default', { month: 'long' });
        filename += `_${monthName}_${reportOptions.year}`;
      }
      filename += `.${format}`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Close dialog after successful download
      onClose();
    } catch (error) {
      console.error("Failed to download report:", error);
      alert("Failed to download report");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day Report</SelectItem>
              <SelectItem value="week">Week Report</SelectItem>
              <SelectItem value="month">Month Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <Select value={format} onValueChange={(value: any) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Date options based on report type */}
      {reportType === 'day' && (
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input 
            type="date" 
            value={reportOptions.date} 
            onChange={(e) => setReportOptions({...reportOptions, date: e.target.value})}
          />
        </div>
      )}
      
      {reportType === 'week' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input 
              type="date" 
              value={reportOptions.start_date} 
              onChange={(e) => setReportOptions({...reportOptions, start_date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input 
              type="date" 
              value={reportOptions.end_date} 
              onChange={(e) => setReportOptions({...reportOptions, end_date: e.target.value})}
            />
          </div>
        </div>
      )}
      
      {reportType === 'month' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <Select 
              value={reportOptions.month.toString()} 
              onValueChange={(value) => setReportOptions({...reportOptions, month: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i+1} value={(i+1).toString()}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <Select 
              value={reportOptions.year.toString()} 
              onValueChange={(value) => setReportOptions({...reportOptions, year: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <DialogFooter>
        <Button 
          onClick={handleDownloadReport} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

// Main component
const TeacherTimetable: React.FC = () => {
  // API URL base
  const API_BASE = '/api';
  
  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [staffName, setStaffName] = useState<string>('');
  
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

  // Define the Day type to ensure type safety
  type Day = {
    id: string;
    day: string;
    dayIndex: number;
    isHoliday?: boolean;
  };
  
  // State variables for API data
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<{id: string; name: string}[]>([]);
  const [subjects, setSubjects] = useState<{id: string; name: string}[]>([]);
  const [divisions, setDivisions] = useState<{id: string; name: string}[]>([]);
  const [timetableId, setTimetableId] = useState<number | null>(null);
  const [holidays, setHolidays] = useState<Array<{id: number; institute_id: number; from_date: string; to_date: string; title: string; description: string}>>([]);
  
  // State for days array to track holidays
  const [days, setDays] = useState<Day[]>([
    { id: 'monday', day: 'Monday', dayIndex: 1 },
    { id: 'tuesday', day: 'Tuesday', dayIndex: 2 },
    { id: 'wednesday', day: 'Wednesday', dayIndex: 3 },
    { id: 'thursday', day: 'Thursday', dayIndex: 4 },
    { id: 'friday', day: 'Friday', dayIndex: 5 },
    { id: 'saturday', day: 'Saturday', isHoliday: false, dayIndex: 6 },
    { id: 'sunday', day: 'Sunday', isHoliday: true, dayIndex: 0 }
  ]);
  
  // Function to fetch weekly holidays
  const fetchWeeklyHolidays = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE}/weekly-holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      
      if (response.data.status) {
        const holidayData = response.data.data.WeeklyHoliday;
        
        if (holidayData && Array.isArray(holidayData.holiday_days)) {
          // Get holiday days from API
          const holidayDays = holidayData.holiday_days as number[];
          
          // Create a deep copy of days to avoid reference issues
          const daysCopy = [...days].map(day => ({ ...day }));
          
          // Mark each day as holiday if it's in the API response
          daysCopy.forEach((day: Day) => {
            if (holidayDays.includes(day.dayIndex)) {
              day.isHoliday = true;
            }
          });
          
          
          // Apply the updated days to the schedule
          setSchedule(prevSchedule => {
            const newSchedule = prevSchedule.map((scheduleDay, index) => {
              const updatedDay = daysCopy[index];
              return {
                ...scheduleDay,
                isHoliday: updatedDay.isHoliday
              };
            });
            return newSchedule;
          });
          
          // Force a re-render by updating the days array
          setDays(daysCopy);
        }
      }
    } catch (error) {
      console.error('Error fetching weekly holidays:', error);
    }
  };
  
  // Initialize schedule with empty slots
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => 
    days.map((day: Day) => ({
      ...day,
      slots: Array(timeSlots.length).fill({subject_id: null, division_id: null}),
    }))
  );

  // Initialize selectedStaff from localStorage or empty string if not found
  const [selectedStaff, setSelectedStaff] = useState<string>(() => {
    // We'll set this based on user data for non-admins, but start with saved value
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
  const [slotDetails, setSlotDetails] = useState<{subject: string; division_id: string}>({ subject: '', division_id: '' });
  
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

  // Type definition for holiday object
  type Holiday = {
    id: number;
    institute_id: number;
    from_date: string;
    to_date: string;
    title: string;
    description: string;
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
  

  
  // Fetch divisions data from API
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/all_divisions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && response.data.status && response.data.data && response.data.data.Division) {
          setDivisions(response.data.data.Division.map((division: any) => ({
            id: division.id.toString(),
            name: division.division || `${division.course_name} - ${division.semester_name} - ${division.room_name}`,
          })));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching divisions:', err);
        setError('Failed to load division data');
        setLoading(false);
      }
    };
    
    fetchDivisions();
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

  // Fetch holidays from API
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/all_holiday`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && response.data.status && response.data.data && response.data.data.Holiday) {
        const holidayData = response.data.data.Holiday;
        
        // Store holidays in state - this will trigger the holiday update effect
        setHolidays(holidayData);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to load holiday data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize when component mounts
  useEffect(() => {
    // Get the initial date for the current week
    const currentDate = new Date();
    setSelectedWeek(currentDate);
    
    // Check if user is admin from localStorage
    const userRole = localStorage.getItem('role');
    setIsAdmin(userRole === 'admin');
    
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setStaffName(userData.name || '');
        
        // For non-admin users, auto-select their staff ID
        if (userRole !== 'admin' && userData.id) {
          // If we have the staff ID in user data, use it
          setSelectedStaff(userData.id.toString());
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    
    // Fetch holidays
    fetchHolidays();
    
    // Fetch staff list
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
    
    // Fetch subjects
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
    
    // Fetch weekly holidays
    fetchWeeklyHolidays();
  }, [API_BASE]);
  
  // Fetch timetable data when staff and week are selected
  useEffect(() => {
    if (selectedStaff && selectedWeek) {
      // First ensure we have holiday data applied before fetching timetable
      if (holidays.length > 0) {
        updateScheduleWithHolidays();
      }
      // Then fetch timetable data
      fetchTimetable();
      
      // For non-admin users, the staff name should already be set from localStorage
    }
  }, [selectedStaff, selectedWeek, staffMembers, isAdmin]);
  
  // Function to fetch timetable data
  const fetchTimetable = async () => {
    if (!selectedStaff || !selectedWeek) {
      return;
    }
    
    setLoading(true);
    setError(null); // Clear any previous errors
    const weekStartDate = getWeekDates(selectedWeek)[0].toISOString().split('T')[0]; // Get Monday's date in YYYY-MM-DD format
    const currentWeekDates = getWeekDates(selectedWeek);
    
    // Create an empty schedule with holiday information preserved
    const emptySchedule = days.map((day, index) => {
      // Get current date for this day
      const currentDate = currentWeekDates[index];
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if this date falls within any holiday period
      const holiday = holidays.find((h: Holiday) => {
        const fromDate = new Date(h.from_date).toISOString().split('T')[0];
        const toDate = h.to_date ? new Date(h.to_date).toISOString().split('T')[0] : fromDate;
        return dateStr >= fromDate && dateStr <= toDate;
      });
      
      // Preserve holiday information if found
      const isHolidayDay = !!holiday;
      const holidayInfo = holiday ? { title: holiday.title, description: holiday.description } : undefined;
      
      return {
        id: day.id,
        day: day.day,
        slots: Array(timeSlots.length).fill({subject_id: null, division_id: null}),
        isHoliday: isHolidayDay || day.isHoliday,
        holidayInfo: holidayInfo
      };
    });
    
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
        
      } catch (apiError: any) {
        // Handle the specific case of 404 "Timetable not found"
        if (apiError.response && apiError.response.status === 404) {
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
          
          timetableData.slots.forEach(slot => {
            const dayIndex = days.findIndex(d => d.id === slot.day.toLowerCase());
            const slotIndex = timeSlots.findIndex(t => t.id === slot.slot_id);
            
            
            if (dayIndex !== -1 && slotIndex !== -1) {
              emptySchedule[dayIndex].slots[slotIndex] = {
                subject_id: slot.subject_id,
                division_id: slot.division_id
              };
            }
          });
        }
        
      } else {
        // No timetable found for this staff and week
        console.log('No timetable found - creating empty schedule');
        setTimetableId(null);
      }
      
      // Set the schedule but ensure we preserve holiday information
      setSchedule(prevSchedule => {
        // Map through the emptySchedule but keep any existing holiday information
        return emptySchedule.map((newDay, index) => {
          const currentDay = prevSchedule[index];
          return {
            ...newDay,
            // Preserve holiday information from current schedule
            isHoliday: currentDay?.isHoliday || newDay.isHoliday,
            holidayInfo: currentDay?.holidayInfo || newDay.holidayInfo
          };
        });
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Failed to load timetable data');
      setLoading(false);
      
      // Reset the schedule with empty slots on error but preserve holiday information
      setSchedule(prevSchedule => {
        return days.map((day, index) => {
          const currentDay = prevSchedule[index];
          return {
            ...day,
            slots: Array(timeSlots.length).fill({subject_id: null, division_id: null}),
            // Preserve holiday information from current schedule
            isHoliday: currentDay?.isHoliday || day.isHoliday,
            holidayInfo: currentDay?.holidayInfo || undefined
          };
        });
      });
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
      const slots: { day: string; time_slot: string; slot_id: string; is_break: boolean; subject_id: string | null; division_id: string | null }[] = [];
      
      schedule.forEach(day => {
        day.slots.forEach((slotData, index) => {
          const timeSlot = timeSlots[index];
          if (timeSlot) {
            slots.push({
              day: day.id,
              time_slot: timeSlot.time,
              slot_id: timeSlot.id,
              is_break: timeSlot.isBreak || false,
              subject_id: slotData.subject_id,
              division_id: slotData.division_id
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
      const slotData = day.slots[index] || {subject_id: null, division_id: null};
      
      // Ensure we get proper display data for the edit dialog
      // Get the correct values from the schedule
      const subjectId = slotData.subject_id ? String(slotData.subject_id) : '';
      const divisionId = slotData.division_id ? String(slotData.division_id) : '';
      
      setSlotDetails({
        subject: subjectId,
        division_id: divisionId
      });
      
      setCurrentSlot({ dayId, slotId, index });
      setIsEditDialogOpen(true);
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
          newSlots[currentSlot.index] = {
            subject_id: slotDetails.subject,
            division_id: slotDetails.division_id
          };
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
                division_id: slotDetails.division_id
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
  
  // Effect to update schedule with holidays when week changes or holidays are loaded
  useEffect(() => {
    if (holidays.length > 0) {
      // Apply holiday information to the schedule
      updateScheduleWithHolidays();
      
      // We don't call fetchTimetable here anymore to avoid race conditions
      // It will be called separately after this effect completes
    }
  }, [selectedWeek, holidays]);
  
  // Function to update the schedule with holiday information without fetching timetable
  const updateScheduleWithHolidays = () => {
    // Get current week dates
    const currentWeekDates = getWeekDates(selectedWeek);
    
    setSchedule(prevSchedule => {
      const updatedSchedule = [...prevSchedule];
      
      // Check each day in the schedule against holiday dates
      updatedSchedule.forEach((day, index) => {
        const currentDate = currentWeekDates[index];
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if this date falls within any holiday period
        const holiday = holidays.find((h: Holiday) => {
          const fromDate = new Date(h.from_date).toISOString().split('T')[0];
          const toDate = h.to_date ? new Date(h.to_date).toISOString().split('T')[0] : fromDate;
          return dateStr >= fromDate && dateStr <= toDate;
        });
        
        if (holiday) {
          // Mark this day as a holiday with the holiday info
          day.isHoliday = true;
          day.holidayInfo = {
            title: holiday.title,
            description: holiday.description
          };
        }
      });
      
      return updatedSchedule;
    });
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
            {isAdmin ? 'Select Staff' : 'Staff'}
          </label>
          {isAdmin ? (
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
          ) : (
            <div className="w-full p-2 border rounded-md bg-gray-50">{staffName}</div>
          )}
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
      
      <div className="mb-4 flex justify-end gap-3">
        <Button 
          disabled={!selectedStaff}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          Allocation
        </Button>
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
          {/* Force equal width columns with fixed sizes */}
          <div className="grid grid-cols-[repeat(7,minmax(120px,1fr))] gap-2 mb-2 table-fixed">
            {daysWithDates.map(day => (
              <div key={day.id} className="p-2 font-bold text-center w-full overflow-hidden">
                <div className="truncate">{day.day}</div>
                <div className="text-xs font-normal truncate">{day.date}</div>
              </div>
            ))}
          </div>
          
          {/* Timetable body */}
          <div className="grid grid-cols-[repeat(7,minmax(120px,1fr))] gap-2 table-fixed">
            {timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slot.id}>
                {days.map(day => {
                  const dayObj = schedule.find(d => d.id === day.id);
                  const slotData = dayObj ? dayObj.slots[slotIndex] : {subject_id: null, division_id: null};
                  
                  // Ensure consistent type comparison (convert to string if needed)
                  const subject = slotData.subject_id ? subjects.find(s => s.id === String(slotData.subject_id)) : null;
                  const division = slotData.division_id ? divisions.find(d => d.id === String(slotData.division_id)) : null;
                  
                  // Get the current date for this day of the week
                  const currentDate = weekDates[days.findIndex(d => d.id === day.id)];
                  const dateStr = currentDate.toISOString().split('T')[0];
                  
                  // Check directly against the holidays array
                  let isHoliday = dayObj?.isHoliday || false;
                  let holidayInfo = dayObj?.holidayInfo;
                  
                  // ALWAYS check directly against the holidays array
                  const matchingHoliday = holidays.find((h) => {
                    const fromDate = new Date(h.from_date).toISOString().split('T')[0];
                    const toDate = h.to_date ? new Date(h.to_date).toISOString().split('T')[0] : fromDate;
                    return dateStr >= fromDate && dateStr <= toDate;
                  });
                  
                  // If we found a holiday, override the schedule settings
                  if (matchingHoliday) {
                    isHoliday = true;
                    holidayInfo = {
                      title: matchingHoliday.title,
                      description: matchingHoliday.description
                    };
                  }
                  
                  // Also check if the day is marked as a weekly holiday in our days array
                  const dayData = days.find(d => d.id === day.id);
                  if (dayData && dayData.isHoliday) {
                    isHoliday = true;
                    if (!holidayInfo) {
                      holidayInfo = {
                        title: 'Weekly Holiday',
                        description: `${dayData.day} Off`
                      };
                    }
                  }
                  
                  if (slot.isBreak) {
                    // Render break slot
                    return (
                      <BreakSlot key={`${day.id}-${slot.id}`}>
                        Lunch Break
                      </BreakSlot>
                    );
                  } else if (isHoliday) {
                    // Render holiday slot
                    return (
                      <TimeSlotComponent 
                        key={`${day.id}-${slot.id}`}
                        day={{ 
                          id: day.id, 
                          isHoliday: true, 
                          holidayInfo 
                        }} 
                        slot={slot} 
                        index={slotIndex}
                        onEditClick={handleEditClick}
                      >
                        <div className="flex flex-col items-center w-full overflow-hidden">
                          <span className="text-red-600 font-medium truncate w-full text-center">{holidayInfo ? 'Holiday' : 'Weekly Holiday'}</span>
                          <span className="text-xs text-gray-600 font-semibold truncate w-full text-center">{holidayInfo ? holidayInfo.title : `${day.day} Off`}</span>
                         
                        </div>
                      </TimeSlotComponent>
                    );
                  } else {
                    // Format date for the current day in YYYY-MM-DD format
                    const formattedDate = currentDate.toISOString().split('T')[0];
                    
                    // Render regular slot
                    return (
                      <TimeSlotComponent 
                        key={`${day.id}-${slot.id}`}
                        day={{ 
                          id: day.id,
                          isHoliday: false
                        }} 
                        slot={slot} 
                        index={slotIndex}
                        date={formattedDate}
                        division_id={slotData.division_id}
                        subject_id={slotData.subject_id}
                        time_slot={timeSlots[slotIndex].time}
                        subjectName={subject?.name}
                        divisionName={division?.name}
                        onEditClick={handleEditClick}
                      >
                        {subject ? (
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-xs text-gray-500">
                              {division ? division.name : 'No Division'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {slot.time}
                          </span>
                        )}
                      </TimeSlotComponent>
                    );
                  }
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
              <label htmlFor="division" className="text-right">
                Division
              </label>
              <div className="col-span-3">
                <Select
                  value={slotDetails.division_id}
                  onValueChange={(value) => setSlotDetails({...slotDetails, division_id: value})}
                  disabled={isViewDialogOpen}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select a division">
                      {slotDetails.division_id && divisions.find(d => d.id === slotDetails.division_id)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map(division => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  subjects.find(s => s.id === slotDetails.subject)?.name || 'Select a subject' : 
                  'Not selected'}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium">Division:</span>
              <div className="col-span-3">
                {slotDetails.division_id ? 
                  divisions.find(d => d.id === slotDetails.division_id)?.name || 'Not selected' : 
                  'Not selected'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherTimetable;
