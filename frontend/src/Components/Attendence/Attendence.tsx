import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from 'sonner';
import { Loader2, BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

interface AttendanceAnalysis {
  division_id: number;
  division_name: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  total_records: number;
  attendance_percentage: number;
}

interface MonthlyAnalysis {
  month_name: string;
  divisions: {
    division_id: number;
    division_name: string;
    present_count: number;
    absent_count: number;
    total_records: number;
    attendance_percentage: number;
  }[];
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
  const [activeTab, setActiveTab] = useState<string>("attendance");
  const [analysisYear, setAnalysisYear] = useState<string>(new Date().getFullYear().toString());
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [yearlyAnalysis, setYearlyAnalysis] = useState<AttendanceAnalysis[]>([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<MonthlyAnalysis[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [regularHolidays, setRegularHolidays] = useState<Holiday[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday[]>([]);
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [holidayInfo, setHolidayInfo] = useState<{title: string; description: string} | null>(null);

  // Fetch divisions and holidays on component mount
  useEffect(() => {
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

  // Fetch students based on division and date
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
      const response = await axios.post(
        `/api/attendance/by-date-division`,
        {
          division_id: divisionId,
          date: date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(response.data.data.students);
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

      await axios.post(
        `/api/attendance/save`,
        {
          division_id: selectedDivision,
          date: selectedDate,
          attendance: attendanceData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Attendance saved successfully");
      setSaveLoading(false);
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
    // Check regular holidays (might span multiple days)
    const foundRegularHoliday = regularHolidays.find(holiday => {
      const fromDate = new Date(holiday.from_date);
      const toDate = new Date(holiday.to_date);
      const checkDate = new Date(date);
      
      return checkDate >= fromDate && checkDate <= toDate;
    });
    
    if (foundRegularHoliday) {
      setIsHoliday(true);
      setHolidayInfo({
        title: foundRegularHoliday.title,
        description: foundRegularHoliday.description
      });
      return true;
    }
    
    // Check weekly holidays
    const foundWeeklyHoliday = weeklyHolidays.find(holiday => 
      holiday.date === date
    );
    
    if (foundWeeklyHoliday) {
      setIsHoliday(true);
      setHolidayInfo({
        title: foundWeeklyHoliday.title,
        description: foundWeeklyHoliday.description
      });
      return true;
    }
    
    // If we reach here, it's not a holiday
    setIsHoliday(false);
    setHolidayInfo(null);
    return false;
  };
  
  // Fetch attendance analysis data by year
  const fetchAttendanceAnalysis = async () => {
    if (!analysisYear) {
      toast.warning("Please select a year for analysis");
      return;
    }

    try {
      setAnalysisLoading(true);
      const response = await axios.get(
        `/api/attendance/analysis?year=${analysisYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setYearlyAnalysis(response.data.data.yearly_analysis);
      setMonthlyAnalysis(response.data.data.monthly_analysis);
      setSelectedMonth(null); // Reset selected month when new data is loaded
      setAnalysisLoading(false);
    } catch (error) {
      console.error("Failed to fetch attendance analysis:", error);
      toast.error("Failed to fetch attendance analysis");
      setAnalysisLoading(false);
    }
  };

  // Handle analysis year change
  const handleAnalysisYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      setAnalysisYear(event.target.value);
    }
  };
  
  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    if (selectedMonth === monthIndex) {
      setSelectedMonth(null); // Deselect if already selected
    } else {
      setSelectedMonth(monthIndex);
    }
  };



  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Student Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attendance" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="attendance">
              Attendance Entry
            </TabsTrigger>
            <TabsTrigger value="analysis">
              Attendance Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance">
            {loading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="division" className="mb-2 block">Select Division</Label>
            <Select onValueChange={handleDivisionChange} disabled={loading}>
              <SelectTrigger className="w-full" id="division">
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
          
          <div>
            <Label htmlFor="date" className="mb-2 block">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={loading}
              className="w-full"
            />
          </div>
        </div>

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
       
               {/* Status display */}
        {selectedDivision && selectedDate && (
          <div className="text-sm text-slate-600 mt-4 p-3 bg-slate-50 rounded-md">
            <p><span className="font-medium">Division:</span> {selectedDivisionName}</p>
            <p><span className="font-medium">Date:</span> {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
            <div className="text-sm text-slate-600 mb-4 md:mb-0">
                <span className="font-medium">Total:</span> {students.length} | 
                <span className="font-medium">Present:</span> {students.filter(s => s.attendance.is_present).length} | 
                <span className="font-medium">Absent:</span> {students.filter(s => !s.attendance.is_present).length}
              </div>
          </div>
        )}
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
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="analysis-year" className="mb-2 block">Select Year for Analysis</Label>
                <Select value={analysisYear} onValueChange={setAnalysisYear} disabled={analysisLoading}>
                  <SelectTrigger className="w-full" id="analysis-year">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={fetchAttendanceAnalysis} 
                  disabled={analysisLoading}
                  className="w-full md:w-auto"
                >
                  {analysisLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Get Yearly Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {analysisLoading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {!analysisLoading && yearlyAnalysis.length > 0 && (
              <>
                <div className="text-sm text-slate-600 mt-4 p-3 bg-slate-50 rounded-md mb-4">
                  <p><span className="font-medium">Analysis Year:</span> {analysisYear}</p>
                </div>
                
                {/* Yearly Summary */}
                <h3 className="text-lg font-medium mb-3">Yearly Summary</h3>
                <div className="rounded-md border overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-3 text-left font-medium">Division</th>
                        <th className="p-3 text-left font-medium">Total Students</th>
                        <th className="p-3 text-left font-medium">Present</th>
                        <th className="p-3 text-left font-medium">Absent</th>
                        <th className="p-3 text-left font-medium">Records</th>
                        <th className="p-3 text-left font-medium">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyAnalysis.map((analysis) => (
                        <tr key={analysis.division_id} className="border-b last:border-0">
                          <td className="p-3">{analysis.division_name}</td>
                          <td className="p-3">{analysis.total_students}</td>
                          <td className="p-3 text-green-600">{analysis.present_count}</td>
                          <td className="p-3 text-red-600">{analysis.absent_count}</td>
                          <td className="p-3">{analysis.total_records}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-green-600 h-2.5 rounded-full" 
                                  style={{ width: `${analysis.attendance_percentage}%` }}
                                ></div>
                              </div>
                              <span>{analysis.attendance_percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Monthly Breakdown */}
                <h3 className="text-lg font-medium mb-3">Monthly Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {monthlyAnalysis.map((month, index) => (
                    <div 
                      key={month.month_name} 
                      className={`p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors ${selectedMonth === index ? 'bg-slate-100 border-primary' : ''}`}
                      onClick={() => handleMonthSelect(index)}
                    >
                      <p className="font-medium">{month.month_name}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {month.divisions.length} divisions with data
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Selected Month Details */}
                {selectedMonth !== null && monthlyAnalysis[selectedMonth]?.divisions.length > 0 && (
                  <>
                    <h4 className="text-md font-medium mb-2">
                      {monthlyAnalysis[selectedMonth].month_name} {analysisYear} Details
                    </h4>
                    <div className="rounded-md border overflow-hidden mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="p-3 text-left font-medium">Division</th>
                            <th className="p-3 text-left font-medium">Present</th>
                            <th className="p-3 text-left font-medium">Absent</th>
                            <th className="p-3 text-left font-medium">Records</th>
                            <th className="p-3 text-left font-medium">Attendance %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyAnalysis[selectedMonth].divisions.map((division) => (
                            <tr key={division.division_id} className="border-b last:border-0">
                              <td className="p-3">{division.division_name}</td>
                              <td className="p-3 text-green-600">{division.present_count}</td>
                              <td className="p-3 text-red-600">{division.absent_count}</td>
                              <td className="p-3">{division.total_records}</td>
                              <td className="p-3">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className="bg-green-600 h-2.5 rounded-full" 
                                      style={{ width: `${division.attendance_percentage}%` }}
                                    ></div>
                                  </div>
                                  <span>{division.attendance_percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
            
            {!analysisLoading && yearlyAnalysis.length === 0 && analysisYear && (
              <div className="text-center p-6 bg-slate-50 rounded-md">
                <p className="text-slate-600">No attendance data found for the selected year.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Attendence;
