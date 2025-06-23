import { useState, useEffect, useMemo, useRef } from 'react';
import { useGetData } from '@/components/HTTP/GET';
import { usePostData } from '@/components/HTTP/POST';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import { Checkbox } from '@/Components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentSummaryData {
  id: number;
  student_name: string;
  challan_paid: boolean;
  exam_form_filled: boolean;
  college_fees_paid: boolean;
  exam_fees_paid: boolean;
  hallticket: boolean;
}

type StudentSummaryBooleanField = keyof Omit<StudentSummaryData, 'id' | 'student_name'>;

const StudentSummary = () => {
  const [students, setStudents] = useState<StudentSummaryData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

  const [challanPaidHeaderChecked, setChallanPaidHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [examFormHeaderChecked, setExamFormHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [collegeFeesHeaderChecked, setCollegeFeesHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [examFeesHeaderChecked, setExamFeesHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [hallTicketHeaderChecked, setHallTicketHeaderChecked] = useState<boolean | 'indeterminate'>(false);

  const columnOptions = [
    { key: 'challan_paid', label: 'Challan Paid' },
    { key: 'exam_form_filled', label: 'Exam Form Filled' },
    { key: 'college_fees_paid', label: 'College Fees Paid' },
    { key: 'exam_fees_paid', label: 'Exam Fees Paid' },
    { key: 'hallticket', label: 'Hall Ticket' },
  ];
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>('');

  const { data: studentData, error, isLoading } = useGetData({
    endpoint: '/api/student-summary',
    params: { queryKey: ['studentSummary'] },
  });

  const { mutate } = usePostData({
    endpoint: '/api/student-summary',
    params: {},
  });

  useEffect(() => {
    if (studentData) {
      const data = studentData as any;
      if (data?.data?.StudentSummary) {
        setStudents(data.data.StudentSummary);
      } else if (Array.isArray(data?.data)) {
        setStudents(data.data);
      }
    }
  }, [studentData]);

  const updateTimers = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const selectAllTimersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const timers = updateTimers.current;
    return () => {
      Object.values(timers).forEach(timerId => clearTimeout(timerId));
      selectAllTimersRef.current.forEach(timerId => clearTimeout(timerId));
    };
  }, []);

  const handleCheckboxChange = (id: number, field: StudentSummaryBooleanField, checked: boolean) => {
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    let studentToUpdate: StudentSummaryData | undefined;
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === id) {
          studentToUpdate = { ...student, [field]: checked };
          return studentToUpdate;
        }
        return student;
      })
    );

    if (updateTimers.current[id]) {
      clearTimeout(updateTimers.current[id]);
    }

    updateTimers.current[id] = setTimeout(() => {
      if (studentToUpdate) {
        const payload = {
          id: studentToUpdate.id,
          field: field,
          value: checked,
        };
        mutate(payload, {
          onSettled: () => {
            setIsUpdating(prev => ({ ...prev, [id]: false }));
            delete updateTimers.current[id];
          },
        });
      }
    }, 1000);
  };

  const filteredStudents = useMemo(() => {
    let results = students;
    if (searchTerm) {
      results = results.filter(student =>
        student.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedColumn && selectedColumn !== 'none' && selectedFilterValue && selectedFilterValue !== 'all') {
      const filterBool = selectedFilterValue === 'true';
      results = results.filter(student => student[selectedColumn as StudentSummaryBooleanField] === filterBool);
    }
    return results;
  }, [students, searchTerm, selectedColumn, selectedFilterValue]);

  const handleSelectAllChange = (field: StudentSummaryBooleanField) => {
    selectAllTimersRef.current.forEach(timerId => clearTimeout(timerId));
    const totalFiltered = filteredStudents.length;
    if (totalFiltered === 0) return;

    const totalChecked = filteredStudents.filter((s: StudentSummaryData) => s[field]).length;
    const areAllChecked = totalChecked === totalFiltered;
    const newCheckedState = !areAllChecked;
    
    const filteredStudentIds = new Set(filteredStudents.map(s => s.id));

    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (filteredStudentIds.has(student.id)) {
          return { ...student, [field]: newCheckedState };
        }
        return student;
      })
    );

    const payloads = filteredStudents.map(student => ({
      id: student.id,
      field: field,
      value: newCheckedState,
    }));

    const newTimers: NodeJS.Timeout[] = [];
    payloads.forEach((payload, index) => {
      const timerId = setTimeout(() => {
        mutate(payload);
      }, index * 100);
      newTimers.push(timerId);
    });
    selectAllTimersRef.current = newTimers;

    if (payloads.length > 0) {
      const reloadTimer = setTimeout(() => {
        window.location.reload();
      }, payloads.length * 100 + 1000);
      selectAllTimersRef.current.push(reloadTimer);
    }
  };

  const getHeaderCheckboxState = (field: StudentSummaryBooleanField): boolean | 'indeterminate' => {
    const totalFiltered = filteredStudents.length;
    if (totalFiltered === 0) return false;
    const totalChecked = filteredStudents.filter((s: StudentSummaryData) => s[field]).length;
    if (totalChecked === 0) return false;
    if (totalChecked === totalFiltered) return true;
    return 'indeterminate';
  };
  
  useEffect(() => {
    setChallanPaidHeaderChecked(getHeaderCheckboxState('challan_paid'));
    setExamFormHeaderChecked(getHeaderCheckboxState('exam_form_filled'));
    setCollegeFeesHeaderChecked(getHeaderCheckboxState('college_fees_paid'));
    setExamFeesHeaderChecked(getHeaderCheckboxState('exam_fees_paid'));
    setHallTicketHeaderChecked(getHeaderCheckboxState('hallticket'));
  }, [filteredStudents]);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();

      // The PDF should reflect the current filters shown on screen
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedColumn && selectedColumn !== 'none' && selectedFilterValue && selectedFilterValue !== 'all') {
        params.append('filter_column', selectedColumn);
        params.append('filter_value', selectedFilterValue);
      }

      // Also pass all column keys to render in the PDF
      const allColumnKeys = columnOptions.map(c => c.key).join(',');
      params.append('columns', allColumnKeys);

      const token = localStorage.getItem('token');
      const url = `/api/student-summary/pdf?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'student-summary.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Download error:', error);
      // You might want to show a user-facing error message here
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load student data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className='m-4'>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Student Summary</CardTitle>
              <CardDescription>
                An overview of student documentation and fee status.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Input
              placeholder="Filter by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedColumn} onValueChange={v => {
                setSelectedColumn(v);
                if (v === 'none') setSelectedFilterValue('');
            }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by column" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {columnOptions.map(option => (
                        <SelectItem key={option.key} value={option.key}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedFilterValue} onValueChange={setSelectedFilterValue} disabled={!selectedColumn || selectedColumn === 'none'}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Value" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox
                      id="selectAllChallanPaid"
                      checked={challanPaidHeaderChecked}
                      onCheckedChange={() => handleSelectAllChange('challan_paid')}
                    />
                    <label htmlFor="selectAllChallanPaid" className="whitespace-nowrap">
                      Challan Paid
                    </label>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox
                      id="selectAllExamForm"
                      checked={examFormHeaderChecked}
                      onCheckedChange={() => handleSelectAllChange('exam_form_filled')}
                    />
                    <label htmlFor="selectAllExamForm" className="whitespace-nowrap">
                      Exam Form Filled
                    </label>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox
                      id="selectAllCollegeFees"
                      checked={collegeFeesHeaderChecked}
                      onCheckedChange={() => handleSelectAllChange('college_fees_paid')}
                    />
                    <label htmlFor="selectAllCollegeFees" className="whitespace-nowrap">
                      College Fees Paid
                    </label>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox
                      id="selectAllExamFees"
                      checked={examFeesHeaderChecked}
                      onCheckedChange={() => handleSelectAllChange('exam_fees_paid')}
                    />
                    <label htmlFor="selectAllExamFees" className="whitespace-nowrap">
                      Exam Fees Paid
                    </label>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox
                      id="selectAllHallTicket"
                      checked={hallTicketHeaderChecked}
                      onCheckedChange={() => handleSelectAllChange('hallticket')}
                    />
                    <label htmlFor="selectAllHallTicket" className="whitespace-nowrap">
                      Hall Ticket
                    </label>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_name || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.challan_paid || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'challan_paid', !!checked)}
                        disabled={isUpdating[student.id]}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.exam_form_filled || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'exam_form_filled', !!checked)}
                        disabled={isUpdating[student.id]}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.college_fees_paid || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'college_fees_paid', !!checked)}
                        disabled={isUpdating[student.id]}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.exam_fees_paid || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'exam_fees_paid', !!checked)}
                        disabled={isUpdating[student.id]}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.hallticket || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'hallticket', !!checked)}
                        disabled={isUpdating[student.id]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No student data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSummary;
