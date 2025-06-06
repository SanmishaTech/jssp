import React, { useState, useEffect } from 'react';
import { Combobox } from "../ui/combobox";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useGetData } from '@/Components/HTTP/GET';
import { usePostData } from '@/Components/HTTP/POST';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Loader2, Save } from 'lucide-react';

// Interface for the subject syllabus record
interface SubjectSyllabus {
  assignment_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  course_id: number;
  course_name: string;
  semester_id: number;
  semester_name: string;
  academic_year_id: number;
  academic_year_name: string;
  completed_percentage: number;
  remarks?: string;
  syllabus_id: number | null;
  last_updated: string | null;
  staff_id: number;
  staff_name: string;
}

const Edittestcard = () => {
  // Retrieve staff info from localStorage
  const [staffId, setStaffId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedStaffId = localStorage.getItem('staff_id');
    const storedRole = localStorage.getItem('role');
    if (storedStaffId) {
      setStaffId(Number(storedStaffId));
    }
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  // State for subject selection and syllabus percentage
  const [selectedSubject, setSelectedSubject] = useState<SubjectSyllabus | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [subjectOptions, setSubjectOptions] = useState<SubjectSyllabus[]>([]);

  // Derived combobox-friendly options
  const comboboxOptions = subjectOptions.map((s) => ({
    value: s.subject_id.toString(),
    label: s.subject_name,
  }));

  // Fetch subjects only if role is 'teachingstaff'
  const { data: subjectsData, error: subjectsError, isLoading: subjectsLoading } = useGetData({
    endpoint: '/api/syllabi/staff',
    params: {
      queryKey: ['staffSubjects'],
      enabled: role === 'teachingstaff'
    }
  });

  // Extract subject list once data is fetched (already parsed JSON)
  useEffect(() => {
    // Assuming subjectsData is already the parsed JSON payload: { status: string, data: SubjectSyllabus[] }
    if (subjectsData && (subjectsData as any).data) {
      setSubjectOptions((subjectsData as any).data as SubjectSyllabus[]);
    } else if (subjectsData && !subjectsData.hasOwnProperty('data') && Array.isArray(subjectsData)) {
      // Fallback if subjectsData is directly the array (less likely based on typical API structure)
      setSubjectOptions(subjectsData as SubjectSyllabus[]);
    } else if (subjectsData) {
      // If subjectsData exists but doesn't match expected structures, log for debugging
      console.warn('Unexpected subjectsData structure:', subjectsData);
      // Potentially set to empty array or show an error
      // setSubjectOptions([]); 
      // toast.error('Unexpected format for subject data.');
    }
  }, [subjectsData]);

  const handleIncrementPercentage = () => {
    setPercentage((prevPercentage) => Math.min(prevPercentage + 2, 100));
  };

  const { mutate, isPending } = usePostData({ 
    endpoint: '/api/syllabi/staff',
    params: {}
  });

  // React-Query client to invalidate queries on successful mutation
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject.');
      return;
    }
    if (percentage < 0 || percentage > 100) {
      toast.error('Percentage should be between 0 and 100.');
      return;
    }

    const payload = {
      subject_id: selectedSubject.subject_id,
      course_id: selectedSubject.course_id,
      semester_id: selectedSubject.semester_id,
      academic_year_id: selectedSubject.academic_year_id,
      completed_percentage: percentage,
      remarks: remarks,
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success('Syllabus completion updated.');
        // Refetch subjects to reflect latest completion status
        queryClient.invalidateQueries({ queryKey: ['staffSubjects'] });
      },
      onError: () => {
        toast.error('Failed to update syllabus.');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-xl w-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        <CardTitle>Update Syllabus Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {role === 'teachingstaff' ? (
          <>
            <div className="grid gap-4">
              <div>
                <p className="text-sm py-2.5"> {/* Adjusted padding to align with other form elements */}
                  <span className="text-muted-foreground">Staff: </span>
                  <span className="font-medium">
                    {subjectOptions?.staff_name ?? (staffId ? `ID ${staffId}` : 'N/A')}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Select Subject</label>
                {subjectsLoading ? (
                  <div>Loading subjects...</div>
                ) : subjectsError ? (
                  <div>Error loading subjects.</div>
                ) : (
                  <Combobox
                    options={comboboxOptions}
                    value={selectedSubject?.subject_id.toString() ?? ''}
                    onValueChange={(value: string) => {
                      const sub = subjectOptions.find((s) => s.subject_id.toString() === value) || null;
                      setSelectedSubject(sub);
                      setPercentage(sub?.completed_percentage ?? 0);
                      setRemarks(sub?.remarks ?? '');
                    }}
                    placeholder="Select Subject"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm mb-1 text-muted-foreground flex justify-between">
                  <span>Syllabus Completion (%)</span>
                  <span className="font-medium">{percentage}%</span>
                </label>
                <div className="flex space-x-2">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[percentage]}
                    onValueChange={(vals: number[]) => {
                      const newPercentage = vals[0];
                      if (newPercentage >= percentage) {
                        setPercentage(newPercentage);
                      }
                    }}
                    className="flex-grow"
                  />
                  <Button
                    onClick={handleIncrementPercentage}
                    variant="ghost"
                    size="icon"
                    aria-label="Increase by 2%"
                    className="relative -top-[11px] hover:bg-transparent hover:text-current"
                  >
                    +2
                  </Button>
                </div>
               </div>

              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Remarks</label>
                <Input
                  value={remarks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemarks(e.target.value)}
                  placeholder="Enter remarks"
                />
              </div>
            </div>
          </>
        ) : (
          <div>You do not have permission to update syllabus completion.</div>
        )}
      </CardContent>
      {role === 'teachingstaff' && (
        <CardFooter className="justify-end">
          <Button onClick={handleSubmit} disabled={isPending || !selectedSubject}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Update
          </Button>
        </CardFooter>
      )}
    </Card>
    </div>
  );
};

export default Edittestcard;
