import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
// Note: Select components removed as they're not used after analysis tab removal
import { toast } from 'sonner';
import { Loader2, Calendar, FileDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";


interface Division {
  id: number;
  division: string;
}

interface Student {
  id: number;
  student_name: string;
  prn: string;
}

interface Attendance {
  id: number | null;
  student_id: number;
  is_present: boolean;
  remarks: string | null;
}

interface StudentWithAttendance {
  student: Student;
  attendance: Attendance;
}



interface Holiday {
  from_date: string;
  to_date: string;
  title: string;
  description: string;
  type: 'regular' | 'weekly';
}

interface WeeklyHoliday {
  date: string;
  title: string;
  description: string;
  type: 'weekly';
}

interface ReportOptions {
  format: 'csv' | 'pdf';
  division_id: number | null;
  // Day report
  date?: string;
  // Week report
  start_date?: string;
  end_date?: string;
  // Month report
  month?: number;
  year?: number;
}

const Attendence: React.FC = () => {
  const token = localStorage.getItem('token');
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedDivisionName, setSelectedDivisionName] = useState<string>("");
  const [regularHolidays, setRegularHolidays] = useState<Holiday[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday[]>([]);
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [holidayInfo, setHolidayInfo] = useState<{title: string; description: string} | null>(null);
  
  // For lecture-specific attendance
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  
  // For report generation
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    format: 'pdf',
    division_id: null,
    date: new Date().toISOString().split('T')[0],
    start_date: subDays(new Date(), 6).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Handle changes to report options
  const handleReportOptionChange = (key: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Download report handlers
  const handleDownloadDayReport = async () => {
    if (!reportOptions.division_id) {
      toast.error("Please select a division");
      return;
    }
    
    try {
      setReportLoading(true);
      const response = await axios({
        method: 'post',
        url: '/api/attendance/reports/day',
        responseType: 'blob', // Important for file download
        data: {
          division_id: reportOptions.division_id,
          date: reportOptions.date,
          format: reportOptions.format
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get division name
      const divisionName = divisions.find(d => d.id === reportOptions.division_id)?.division || 'division';
      
      // Generate filename
      const filename = `attendance_${divisionName}_${reportOptions.date}.${reportOptions.format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report");
    } finally {
      setReportLoading(false);
    }
  };
  
  const handleDownloadWeekReport = async () => {
    if (!reportOptions.division_id) {
      toast.error("Please select a division");
      return;
    }
    
    try {
      setReportLoading(true);
      const response = await axios({
        method: 'post',
        url: '/api/attendance/reports/week',
        responseType: 'blob',
        data: {
          division_id: reportOptions.division_id,
          start_date: reportOptions.start_date,
          end_date: reportOptions.end_date,
          format: reportOptions.format
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get division name
      const divisionName = divisions.find(d => d.id === reportOptions.division_id)?.division || 'division';
      
      // Generate filename
      const filename = `attendance_${divisionName}_week_${reportOptions.start_date}_to_${reportOptions.end_date}.${reportOptions.format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report");
    } finally {
      setReportLoading(false);
    }
  };
  
  const handleDownloadMonthReport = async () => {
    if (!reportOptions.division_id) {
      toast.error("Please select a division");
      return;
    }
    
    try {
      setReportLoading(true);
      const response = await axios({
        method: 'post',
        url: '/api/attendance/reports/month',
        responseType: 'blob',
        data: {
          division_id: reportOptions.division_id,
          month: reportOptions.month,
          year: reportOptions.year,
          format: reportOptions.format
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get division name and month name
      const divisionName = divisions.find(d => d.id === reportOptions.division_id)?.division || 'division';
      const monthName = new Date(reportOptions.year!, reportOptions.month! - 1).toLocaleString('default', { month: 'long' });
      
      // Generate filename
      const filename = `attendance_${divisionName}_${monthName}_${reportOptions.year}.${reportOptions.format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report");
    } finally {
      setReportLoading(false);
    }
  };

  // Parse query parameters from URL on component mount
  useEffect(() => {
    // Get query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const divisionIdParam = urlParams.get('division_id');
    const dateParam = urlParams.get('date');
    const timeSlotParam = urlParams.get('time_slot');
    const subjectIdParam = urlParams.get('subject_id');
    const slotIdParam = urlParams.get('slot_id');
    
    // Set the selected values if parameters exist
    if (divisionIdParam) {
      const numericDivisionId = parseInt(divisionIdParam);
      setSelectedDivision(numericDivisionId);
    }
    
    if (dateParam) {
      setSelectedDate(dateParam);
    }
    
    if (timeSlotParam) {
      setSelectedTimeSlot(timeSlotParam);
    }
    
    if (subjectIdParam) {
      setSelectedSubjectId(subjectIdParam);
    }
    
    if (slotIdParam) {
      setSelectedSlotId(slotIdParam);
    }
    
    // Fetch necessary data
    fetchDivisions();
    fetchHolidays();
  }, []);

  // Fetch divisions from API
  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/all_divisions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDivisions(response.data.data.Division);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
      toast.error("Failed to fetch divisions");
      setLoading(false);
    }
  };
  
  // Process query parameters and load data once divisions are loaded
  useEffect(() => {
    if (divisions.length > 0 && selectedDivision) {
      // Find division name for the selected division
      const division = divisions.find(d => d.id === selectedDivision);
      if (division) {
        setSelectedDivisionName(division.division);
      }
      
      // Load attendance data if we have both division and date
      if (selectedDate) {
        // Check if the selected date is a holiday
        const holiday = checkIfHoliday(selectedDate);
        
        // Fetch students with attendance
        fetchStudentsWithAttendance(selectedDivision, selectedDate, holiday);
      }
    }
  }, [divisions]);

  // Fetch students based on division and date (and optional lecture-specific params)
  const fetchStudentsWithAttendance = async (divisionId: number, date: string, isHolidayDate?: boolean) => {
    if (!divisionId || !date) {
      toast.warning("Please select both division and date");
      return;
    }
    
    // Use passed holiday status or check if it's a holiday
    const isDateHoliday = isHolidayDate !== undefined ? isHolidayDate : checkIfHoliday(date);
    
    // If it's a holiday, don't fetch students
    if (isDateHoliday) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      const requestData: any = {
        division_id: divisionId,
        date: date,
      };
      
      // Add lecture-specific parameters if available
      if (selectedTimeSlot) {
        requestData.time_slot = selectedTimeSlot;
      }
      
      if (selectedSubjectId) {
        requestData.subject_id = selectedSubjectId;
      }
      
      if (selectedSlotId) {
        requestData.slot_id = selectedSlotId;
      }
      
      const response = await axios.post(
        `/api/attendance/by-date-division`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setStudents(response.data.data.students);
      
      // Update subject name if available from the response data
      if (response.data.data.subject_name) {
        setSelectedSubjectName(response.data.data.subject_name);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch students with attendance:", error);
      toast.error("Failed to fetch students");
      setLoading(false);
    }
  };

  // Handle division change and fetch students automatically
  const handleDivisionChange = (value: string) => {
    const numericValue = parseInt(value);
    setSelectedDivision(numericValue);
    
    // Find division name for display
    const division = divisions.find(d => d.id === numericValue);
    if (division) {
      setSelectedDivisionName(division.division);
    }
    
    // Automatically fetch students when division changes
    if (numericValue && selectedDate) {
      // Use current holiday status
      fetchStudentsWithAttendance(numericValue, selectedDate, isHoliday);
    }
  };

  // Handle date change and fetch students if division is already selected
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const newDate = event.target.value;
      setSelectedDate(newDate);
      
      // Check if the selected date is a holiday
      const holiday = checkIfHoliday(newDate);
      
      // Automatically fetch students if division is already selected
      if (selectedDivision) {
        fetchStudentsWithAttendance(selectedDivision, newDate, holiday);
      }
    }
  };

  // Toggle attendance status for a student
  const toggleAttendance = (studentId: number) => {
    setStudents(prev => 
      prev.map(item => 
        item.student.id === studentId 
          ? { 
              ...item, 
              attendance: {
                ...item.attendance,
                is_present: !item.attendance.is_present
              }
            } 
          : item
      )
    );
  };

  // Handle form submission to save attendance
  const handleSubmit = async () => {
    // Check if selected date is a holiday
    if (isHoliday) {
      toast.error("Cannot save attendance for a holiday");
      return;
    }
    
    try {
      setSaveLoading(true);
      const attendanceData = students.map(item => ({
        student_id: item.student.id,
        is_present: item.attendance.is_present,
        remarks: item.attendance.remarks
      }));

      const requestData: any = {
        division_id: selectedDivision,
        date: selectedDate,
        attendance: attendanceData
      };
      
      // Add lecture-specific parameters if available
      if (selectedTimeSlot) {
        requestData.time_slot = selectedTimeSlot;
      }
      
      if (selectedSubjectId) {
        requestData.subject_id = selectedSubjectId;
      }
      
      if (selectedSlotId) {
        requestData.slot_id = selectedSlotId;
      }

      await axios.post(
        `/api/attendance/save`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Attendance saved successfully");
      setSaveLoading(false);
      
      // Navigate to TeacherTimetable after successful save
      window.location.href = '/teachertimetable';
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("Failed to save attendance");
      setSaveLoading(false);
    }
  };

  // Fetch holidays from API
  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`/api/calendar_holidays`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.status) {
        setRegularHolidays(response.data.data.regular_holidays || []);
        setWeeklyHolidays(response.data.data.weekly_holidays || []);
        
        // Check if current selected date is a holiday
        const isDateHoliday = checkIfHoliday(selectedDate);
        
        // If division is selected, update student list based on holiday status
        if (selectedDivision && isDateHoliday) {
          setStudents([]);
        } else if (selectedDivision && !isDateHoliday && students.length === 0) {
          fetchStudentsWithAttendance(selectedDivision, selectedDate, isDateHoliday);
        }
      }
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      toast.error("Failed to fetch holiday information");
    }
  };

  // Check if a date is a holiday and update the state accordingly
  // Returns true if it's a holiday, false otherwise
  const checkIfHoliday = (date: string): boolean => {
    // First check regular holidays
    for (const holiday of regularHolidays) {
      const fromDate = new Date(holiday.from_date);
      const toDate = new Date(holiday.to_date);
      const checkDate = new Date(date);
      
      // Normalize all dates to midnight for comparison
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate >= fromDate && checkDate <= toDate) {
        setIsHoliday(true);
        setHolidayInfo({
          title: holiday.title,
          description: holiday.description
        });
        return true;
      }
    }
    
    // Then check weekly holidays
    for (const holiday of weeklyHolidays) {
      if (holiday.date === date) {
        setIsHoliday(true);
        setHolidayInfo({
          title: holiday.title,
          description: holiday.description
        });
        return true;
      }
    }
    
    // Not a holiday
    setIsHoliday(false);
    setHolidayInfo(null);
    return false;
  };
  

  
  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Student Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Information panel showing lecture details */}
        {selectedDivision && selectedDate && (
          <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Attendance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm"><span className="font-medium">Division:</span> {selectedDivisionName}</p>
                <p className="text-sm"><span className="font-medium">Date:</span> {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                {selectedTimeSlot && (
                  <p className="text-sm"><span className="font-medium">Time Slot:</span> {selectedTimeSlot}</p>
                )}
                {selectedSubjectName && (
                  <p className="text-sm"><span className="font-medium">Subject:</span> {selectedSubjectName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fetch Students button removed - automatic fetching on division/date selection */}

        {/* Holiday Alert */}
        {isHoliday && holidayInfo && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              <h4 className="font-medium text-red-700">{holidayInfo.title}</h4>
            </div>
            <div className="mt-2 text-red-600">
              Today is a holiday. No attendance will be recorded for this day.
              {holidayInfo.description && (
                <p className="mt-1 text-sm text-red-500">{holidayInfo.description}</p>
              )}
            </div>
          </div>
        )}
        
        {students.length > 0 && !isHoliday && (
          <>
            {/* Attendance statistics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-md text-center">
                <div className="text-sm font-medium text-gray-500">Total Students</div>
                <div className="text-2xl font-bold text-gray-700">{students.length}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md text-center">
                <div className="text-sm font-medium text-green-600">Present</div>
                <div className="text-2xl font-bold text-green-700">{students.filter(s => s.attendance.is_present).length}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-md text-center">
                <div className="text-sm font-medium text-red-600">Absent</div>
                <div className="text-2xl font-bold text-red-700">{students.filter(s => !s.attendance.is_present).length}</div>
              </div>
            </div>
            <div className="rounded-md border overflow-hidden mb-4 mt-3">
              
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 text-left font-medium">PRN</th>
                    <th className="p-3 text-left font-medium">Student Name</th>
                    <th className="p-3 text-left font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.student.id} className="border-b last:border-0">
                      <td className="p-3">{student.student.prn}</td>
                      <td className="p-3">{student.student.student_name}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Checkbox 
                            id={`student-${student.student.id}`}
                            checked={student.attendance.is_present} 
                            onCheckedChange={() => toggleAttendance(student.student.id)}
                            className="mr-2"
                          />
                          <Label htmlFor={`student-${student.student.id}`} className="cursor-pointer">
                            {student.attendance.is_present ? 'Present' : 'Absent'}
                          </Label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <Button
                onClick={handleSubmit}
                disabled={saveLoading}
                className="w-full md:w-auto"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Attendance'
                )}
              </Button>
            </div>
            
            {/* Report Download Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Download Attendance Reports</h3>
              
              <div className="mb-4">
                <Label htmlFor="report-division" className="mb-2 block">Select Division</Label>
                <Select 
                  value={reportOptions.division_id?.toString() || ''} 
                  onValueChange={(value) => handleReportOptionChange('division_id', parseInt(value))}
                >
                  <SelectTrigger id="report-division" className="w-full">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map(division => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label className="mb-2 block">Report Format</Label>
                <RadioGroup 
                  value={reportOptions.format} 
                  onValueChange={(value) => handleReportOptionChange('format', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <Label htmlFor="format-pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="format-csv" />
                    <Label htmlFor="format-csv">CSV</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Tabs defaultValue="day" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Day-wise</TabsTrigger>
                  <TabsTrigger value="week">Week-wise</TabsTrigger>
                  <TabsTrigger value="month">Month-wise</TabsTrigger>
                </TabsList>
                
                <TabsContent value="day" className="space-y-4 pt-4">
                  <div className="mb-4">
                    <Label htmlFor="day-date" className="mb-2 block">Select Date</Label>
                    <Input 
                      id="day-date" 
                      type="date" 
                      value={reportOptions.date} 
                      onChange={(e) => handleReportOptionChange('date', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleDownloadDayReport} 
                    disabled={reportLoading || !reportOptions.division_id}
                    className="w-full"
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Day Report
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="week" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="week-start-date" className="mb-2 block">Start Date</Label>
                      <Input 
                        id="week-start-date" 
                        type="date" 
                        value={reportOptions.start_date} 
                        onChange={(e) => handleReportOptionChange('start_date', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="week-end-date" className="mb-2 block">End Date</Label>
                      <Input 
                        id="week-end-date" 
                        type="date" 
                        value={reportOptions.end_date} 
                        onChange={(e) => handleReportOptionChange('end_date', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDownloadWeekReport} 
                    disabled={reportLoading || !reportOptions.division_id}
                    className="w-full"
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Week Report
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="month" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month-select" className="mb-2 block">Month</Label>
                      <Select 
                        value={reportOptions.month?.toString()} 
                        onValueChange={(value) => handleReportOptionChange('month', parseInt(value))}
                      >
                        <SelectTrigger id="month-select" className="w-full">
                          <SelectValue placeholder="Select Month" />
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
                      <Label htmlFor="year-select" className="mb-2 block">Year</Label>
                      <Select 
                        value={reportOptions.year?.toString()} 
                        onValueChange={(value) => handleReportOptionChange('year', parseInt(value))}
                      >
                        <SelectTrigger id="year-select" className="w-full">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDownloadMonthReport} 
                    disabled={reportLoading || !reportOptions.division_id}
                    className="w-full"
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Month Report
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

            {selectedDivision && selectedDate && students.length === 0 && !loading && !isHoliday && (
              <div className="text-center p-6 bg-slate-50 rounded-md">
                <p className="text-slate-600">No students found in this division for the selected date.</p>
              </div>
            )}
      </CardContent>
    </Card>
  );
};

export default Attendence;
