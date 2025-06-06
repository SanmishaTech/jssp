import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { toast } from 'sonner';
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

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
