import React, { useState, useEffect } from 'react';
import { Combobox } from "../ui/combobox";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useGetData } from '@/Components/HTTP/GET';
import { usePostData } from '@/Components/HTTP/POST';
import { useQueryClient } from '@tanstack/react-query';
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

  // Admin specific state
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [staffDropdownOptions, setStaffDropdownOptions] = useState<{ value: string; label: string }[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectSyllabus[]>([]);

  // Derived combobox-friendly options
  const comboboxOptions = subjectOptions.map((s) => ({
    value: s.subject_id.toString(),
    label: s.subject_name,
  }));

  // Data fetching hooks
  // Fetch subjects for teaching staff
  const {
    data: subjectsData,
    error: subjectsError,
    isLoading: subjectsLoading,
  } = useGetData({
    endpoint: '/api/syllabi/staff',
    params: {
      queryKey: ['staffSubjects'],
      enabled: role === 'teachingstaff',
    },
  });

  // Fetch all staff list for admin dropdown
  const {
    data: allStaffData,
    error: staffError,
    isLoading: staffLoading,
  } = useGetData({
    endpoint: '/api/staff',
    params: {
      queryKey: ['allStaff'],
      enabled: role === 'admin',
    },
  });

  // Fetch syllabus for the selected staff (admin view)
  const {
    data: adminSubjectsData,
    error: adminSubjectsError,
    isLoading: adminSubjectsLoading,
  } = useGetData({
    endpoint: `/api/syllabi/staff?staff_id=${selectedStaffId ?? ''}`,
    params: {
      queryKey: ['staffSubjects', selectedStaffId],
      enabled: role === 'admin' && !!selectedStaffId,
    },
  });

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

  // Populate staff dropdown options when data arrives
  useEffect(() => {
    if (role === 'admin' && allStaffData && (allStaffData as any).data) {
      const rawStaff = (allStaffData as any).data.Staff ?? (allStaffData as any).data;
      if (Array.isArray(rawStaff)) {
        const opts = rawStaff.map((st: any) => ({
          value: st.id?.toString() ?? '',
          label: st.staff_name ?? st.name ?? `Staff ${st.id}`,
        }));
        setStaffDropdownOptions(opts);
      }
    }
  }, [role, allStaffData]);

  // Update subject list when admin selects a staff and data arrives
  useEffect(() => {
    if (role === 'admin' && adminSubjectsData && (adminSubjectsData as any).data) {
      setSubjectOptions((adminSubjectsData as any).data as SubjectSyllabus[]);
    }
  }, [role, adminSubjectsData]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl w-full p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800"> Syllabus Completion</h2>
        <div className="space-y-6">
          {/* ---------------- Teaching Staff View ---------------- */}
          {role === 'teachingstaff' && (
            <>
              <div className="grid gap-4">
                <div>
                  <p className="text-lg font-medium text-gray-700">Staff: <span className="text-blue-600">{subjectOptions?.[0]?.staff_name ?? 'N/A'}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Select Subject</label>
                  {subjectsLoading ? (
                    <div className="text-gray-500">Loading subjects...</div>
                  ) : subjectsError ? (
                    <div className="text-red-500">Error loading subjects.</div>
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
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex justify-between">
                    <span>Syllabus Completion (%)</span>
                    <span className="font-bold text-gray-800">{percentage}%</span>
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
                      className="relative -top-[11px] hover:bg-blue-100 hover:text-blue-600"
                    >
                      +2
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks</label>
                  <div className="flex flex-col">
                    <Input
                      value={remarks}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemarks(e.target.value)}
                      placeholder="Enter remarks"
                      maxLength={100}
                      className="border border-gray-300 rounded-md p-2"
                    />
                    <span className="text-xs text-gray-500 mt-1">{remarks.length}/100</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* ---------------- Admin View ---------------- */}
          {role === 'admin' && (
            <>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Select Staff</label>
                  {staffLoading ? (
                    <div className="text-gray-500">Loading staff...</div>
                  ) : staffError ? (
                    <div className="text-red-500">Error loading staff list.</div>
                  ) : (
                    <Combobox
                      options={staffDropdownOptions}
                      value={selectedStaffId?.toString() ?? ''}
                      onValueChange={(value: string) => {
                        setSelectedStaffId(value ? Number(value) : null);
                        setSubjectOptions([]);
                      }}
                      placeholder="Select Staff"
                    />
                  )}
                </div>
                {selectedStaffId && (
                  <div className="space-y-4">
                    {adminSubjectsLoading ? (
                      <div className="text-gray-500">Loading syllabus...</div>
                    ) : adminSubjectsError ? (
                      <div className="text-red-500">Error loading syllabus.</div>
                    ) : subjectOptions.length === 0 ? (
                      <div className="text-gray-500">No syllabus records found for this staff.</div>
                    ) : (
                      subjectOptions.map((sub) => (
                        <div
                          key={sub.subject_id}
                          className="p-4 border rounded-md shadow-sm hover:shadow transition-all"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-gray-800">{sub.subject_name}</span>
                            <span className="text-sm text-gray-600">
                              {sub.completed_percentage}%
                            </span>
                          </div>
                          <Progress value={sub.completed_percentage} />
                          {sub.remarks && (
                            <p className="text-sm text-gray-600 mt-1 break-all whitespace-normal">
                              Remarks: {sub.remarks}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          {role !== 'teachingstaff' && role !== 'admin' && (
            <div className="text-red-500 font-semibold">You do not have permission to view this page.</div>
          )}
        </div>
        {role === 'teachingstaff' && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleSubmit} disabled={isPending || !selectedSubject} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Update
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Edittestcard;
