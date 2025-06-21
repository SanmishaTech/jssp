import { useState, useEffect, useMemo, useRef } from 'react';
import { useGetData } from '@/Components/HTTP/GET';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Checkbox } from '@/Components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { usePostData } from '@/components/HTTP/POST';

const StudentSummary = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { data: studentData, error, isLoading } = useGetData({
    endpoint: '/api/student-summary',
    params: { queryKey: ['studentSummary'] },
  });

  const { mutate, isPending: isUpdating } = usePostData({
    endpoint: '/api/student-summary',
    params: {},
  });

  useEffect(() => {
    if (studentData) {
      const data = studentData as any;
      if (data && data.data && Array.isArray(data.data.StudentSummary)) {
        setStudents(data.data.StudentSummary);
      } else if (data && data.data && Array.isArray(data.data)) {
        setStudents(data.data);
      } else if (Array.isArray(data)) {
        setStudents(data);
      }
    }
  }, [studentData]);

  const updateTimers = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const selectAllTimersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // This effect runs once on mount and returns a cleanup function.
    // The cleanup function is called when the component unmounts.
    const timers = updateTimers.current;
    return () => {
      Object.values(timers).forEach(timerId => clearTimeout(timerId));
      selectAllTimersRef.current.forEach(timerId => clearTimeout(timerId));
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount.

  const handleCheckboxChange = (id: number, field:string, checked: boolean) => {
    let studentToUpdate: any;

    // Optimistically update local state first for instant UI feedback
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === id) {
          // This is the student we are updating.
          studentToUpdate = { ...student, [field]: checked };
          return studentToUpdate;
        }
        return student;
      })
    );

    // Clear any existing timer for this specific student to prevent multiple updates in quick succession.
    if (updateTimers.current[id]) {
      clearTimeout(updateTimers.current[id]);
    }

    // Set a new timer to send the update to the backend after a short delay.
    // This is called "debouncing".
    updateTimers.current[id] = setTimeout(() => {
      if (studentToUpdate) {
        const payload = {
          ...studentToUpdate,
          student_id: studentToUpdate.id, // The backend expects 'student_id'.
        };
        delete payload.id; // Clean up the payload.

        // Call the mutation to update the data on the server.
        mutate(payload);
      }
    }, 500); // Wait for 500ms of inactivity before sending the update.
  };

  const filteredStudents = useMemo(() => students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [students, searchTerm]);

  const [challanPaidHeaderChecked, setChallanPaidHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [examFormHeaderChecked, setExamFormHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [collegeFeesHeaderChecked, setCollegeFeesHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [examFeesHeaderChecked, setExamFeesHeaderChecked] = useState<boolean | 'indeterminate'>(false);
  const [hallTicketHeaderChecked, setHallTicketHeaderChecked] = useState<boolean | 'indeterminate'>(false);

  const handleSelectAllChange = (field: string) => {
    // Clear any pending select-all updates to prevent race conditions
    selectAllTimersRef.current.forEach(timerId => clearTimeout(timerId));

    const totalFiltered = filteredStudents.length;
    if (totalFiltered === 0) return;

    const totalChecked = filteredStudents.filter(s => s[field]).length;
    const areAllChecked = totalChecked === totalFiltered;
    const newCheckedState = !areAllChecked;

    const filteredStudentIds = new Set(filteredStudents.map(s => s.id));
    const payloads: any[] = [];

    // Optimistically update the UI for immediate feedback
    setStudents(prevStudents =>
        prevStudents.map(student => {
            if (filteredStudentIds.has(student.id)) {
                const payload = { ...student, [field]: newCheckedState, student_id: student.id };
                delete payload.id;
                payloads.push(payload);
                return { ...student, [field]: newCheckedState };
            }
            return student;
        })
    );

    // To prevent flooding the server with requests, we send them one by one
    // with a small delay between each. This is a form of throttling.
    const newTimers: NodeJS.Timeout[] = [];
    payloads.forEach((payload, index) => {
        const timerId = setTimeout(() => {
            mutate(payload);
        }, index * 100); // Stagger requests by 100ms
        newTimers.push(timerId);
    });
    selectAllTimersRef.current = newTimers;

    if (payloads.length > 0) {
        const reloadTimer = setTimeout(() => {
            window.location.reload();
        }, payloads.length * 100 + 1000); // Wait for staggered requests + 1s buffer
        selectAllTimersRef.current.push(reloadTimer);
    }
  };

  useEffect(() => {
    const totalFiltered = filteredStudents.length;
    const setHeaderState = (
      totalChecked: number,
      setState: React.Dispatch<React.SetStateAction<boolean | 'indeterminate'>>
    ) => {
      if (totalFiltered === 0) {
        setState(false);
        return;
      }
      if (totalChecked === totalFiltered) {
        setState(true);
      } else if (totalChecked > 0) {
        setState('indeterminate');
      } else {
        setState(false);
      }
    };

    setHeaderState(filteredStudents.filter(s => s.challan_paid).length, setChallanPaidHeaderChecked);
    setHeaderState(filteredStudents.filter(s => s.exam_form_filled).length, setExamFormHeaderChecked);
    setHeaderState(filteredStudents.filter(s => s.college_fees_paid).length, setCollegeFeesHeaderChecked);
    setHeaderState(filteredStudents.filter(s => s.exam_fees_paid).length, setExamFeesHeaderChecked);
    setHeaderState(filteredStudents.filter(s => s.hallticket).length, setHallTicketHeaderChecked);
  }, [filteredStudents]);

  const handleDownloadPdf = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    let reportUrl = '/api/student-summary/pdf';
    if (searchTerm) {
      reportUrl += `?search=${encodeURIComponent(searchTerm)}`;
    }

    fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student-summary-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setIsReportDialogOpen(false);

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    })
    .catch(error => {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    });
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
          <CardTitle>Student Summary</CardTitle>
          <CardDescription>An overview of student administrative statuses.</CardDescription>
          <div className="flex justify-between items-center mt-4">
            <Input
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Report</Button>
              </DialogTrigger>
              <DialogContent className='bg-white'>
                <DialogHeader>
                  <DialogTitle>Download Report</DialogTitle>
                  <DialogDescription>
                    The generated report will include all students currently displayed in the table.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>Click the button below to download the student summary report as a PDF.</p>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleDownloadPdf}>Download PDF</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.exam_form_filled || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'exam_form_filled', !!checked)}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.college_fees_paid || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'college_fees_paid', !!checked)}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.exam_fees_paid || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'exam_fees_paid', !!checked)}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.hallticket || false}
                        onCheckedChange={(checked) => handleCheckboxChange(student.id, 'hallticket', !!checked)}
                        disabled={isUpdating}
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
