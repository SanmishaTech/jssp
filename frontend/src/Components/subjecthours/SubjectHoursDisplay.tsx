import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface StaffInfo {
  id: number;
  staff_name: string;
  academic_years_id?: number;
  course_id: number[];
  semester_id: number[];
  subject_id: number[];
}

interface AcademicYear {
  id: number;
  academic_year: string;
}

interface Course {
  id: number;
  course_name: string;
}

interface Semester {
  id: number;
  semester_name: string;
}

interface Subject {
  id: number;
  subject_name: string;
  sub_subjects?: SubSubject[];
}

interface SubSubject {
  id: number;
  sub_subject_name: string;
  hours?: number;
}

export default function SubjectHoursDisplay() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const token = localStorage.getItem("token");

  // We'll get staff assignments directly from the subject hours API

  // We'll only fetch data from the staff-sub-subject-hours endpoint to avoid conflicts

  // We don't need to separately fetch sub-subjects as they come with the subject hours data
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!staffInfo || !staffInfo.subject_id || staffInfo.subject_id.length === 0) return;
      
      try {
        // This is just a placeholder for any future subject-specific API calls we might need
        // Currently, we're getting all the information we need from the staff-sub-subject-hours endpoint
        console.log('Staff has', staffInfo.subject_id.length, 'assigned subjects');
      } catch (error) {
        console.error('Error fetching subject details:', error);
      }
    };

    fetchSubjectDetails();
  }, [staffInfo]);

  // Fetch subject hours and staff assignments in one API call
  useEffect(() => {
    const fetchSubjectHoursAndAssignments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/staff-sub-subject-hours', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extract staff assignments
        if (response.data?.data?.staff_assignments) {
          setStaffInfo({
            id: response.data.data.staff_assignments.staff_id,
            staff_name: '',  // This comes from auth context
            academic_years_id: response.data.data.staff_assignments.academic_year?.id,
            course_id: response.data.data.staff_assignments.courses.map((c: any) => c.id),
            semester_id: response.data.data.staff_assignments.semesters.map((s: any) => s.id),
            subject_id: response.data.data.staff_assignments.subjects.map((s: any) => s.id),
          });
          
          // Also update the reference data collections
          if (response.data.data.staff_assignments.courses.length > 0) {
            setCourses(response.data.data.staff_assignments.courses);
          }
          
          if (response.data.data.staff_assignments.semesters.length > 0) {
            setSemesters(response.data.data.staff_assignments.semesters);
          }
          
          if (response.data.data.staff_assignments.subjects.length > 0) {
            setSubjects(response.data.data.staff_assignments.subjects);
            
            // Initialize editingHours with existing values
            const initialHours: Record<string, number> = {};
            response.data.data.staff_assignments.subjects.forEach((subject: Subject) => {
              if (subject.sub_subjects) {
                subject.sub_subjects.forEach((subSubject: SubSubject) => {
                  if (subSubject.hours !== undefined) {
                    initialHours[`${subject.id}-${subSubject.id}`] = subSubject.hours;
                  }
                });
              }
            });
            setEditingHours(initialHours);
          }
          
          if (response.data.data.staff_assignments.academic_year) {
            setAcademicYears([response.data.data.staff_assignments.academic_year]);
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching subject hours:', error);
        setError('Failed to load subject hours data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectHoursAndAssignments();
  }, [token]);

  const getSemesterById = (id: number) => {
    const semester = semesters.find(s => s.id === id);
    return semester ? semester.semester : 'N/A';
  };
  
  const getSubjectById = (id: number) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.subject_name : 'N/A';
  };

  const [editingHours, setEditingHours] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<boolean>(false);

  const handleHoursChange = (subjectId: number, subSubjectId: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setEditingHours(prev => ({
      ...prev,
      [`${subjectId}-${subSubjectId}`]: numValue
    }));
  };

  const saveAllHours = async () => {
    if (Object.keys(editingHours).length === 0) {
      toast.warning('No changes to save.');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare all the hour updates
      const updates = Object.entries(editingHours).map(([key, hours]) => {
        const [subjectId, subSubjectId] = key.split('-').map(Number);
        return {
          subject_id: subjectId,
          sub_subject_id: subSubjectId,
          hours: hours || 0,
          academic_year_id: staffInfo?.academic_years_id,
          course_id: staffInfo?.course_id[0],
          semester_id: staffInfo?.semester_id[0],
        };
      });
      
      // Call your API to save all hours at once
      await axios.post('/api/staff-sub-subject-hours/batch', {
        updates
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear all editing states
      setEditingHours({});
      
      // Show success toast message
      toast.success('All hours saved successfully!');
      
      // Refresh the page after a short delay to allow the toast to be seen
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving hours:', error);
      toast.error('Failed to save hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Staff Information Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h2 className="text-2xl font-bold mb-2">Staff Assignments</h2>
          <p className="text-gray-700">Your assigned academic years, courses, semesters and subjects</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            // Show loading state
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : error ? (
            // Show error message
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : !staffInfo ? (
            // Show empty state
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p className="font-bold">No staff information found</p>
              <p>Your staff profile could not be loaded. Please contact the administrator.</p>
            </div>
          ) : (
            // Show staff assignments
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Year */}
              <div className="border rounded-md p-4">
                <h3 className="font-semibold text-lg mb-2">Academic Year</h3>
                {staffInfo.academic_years_id ? (
                  <div className="text-sm text-gray-700">
                    {academicYears.find(y => y.id === staffInfo.academic_years_id)?.academic_year}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No academic year assigned</div>
                )}
              </div>
              
              {/* Courses */}
              <div className="border rounded-md p-4">
                <h3 className="font-semibold text-lg mb-2">Assigned Courses</h3>
                {staffInfo.course_id && staffInfo.course_id.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1">
                    {staffInfo.course_id.map(courseId => (
                      <div key={courseId} className="text-sm text-gray-700 py-1 px-2 bg-gray-100 rounded">
                        {courses.find(c => c.id === courseId)?.faculty_title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No courses assigned</div>
                )}
              </div>
              
              {/* Semesters */}
              <div className="border rounded-md p-4">
                <h3 className="font-semibold text-lg mb-2">Assigned Semesters</h3>
                {staffInfo.semester_id && staffInfo.semester_id.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1">
                    {staffInfo.semester_id.map(semesterId => (
                      <div key={semesterId} className="text-sm text-gray-700 py-1 px-2 bg-gray-100 rounded">
                        {getSemesterById(semesterId)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No semesters assigned</div>
                )}
              </div>
              
              {/* Subjects */}
              <div className="border rounded-md p-4">
                <h3 className="font-semibold text-lg mb-2">Assigned Subjects</h3>
                {staffInfo.subject_id && staffInfo.subject_id.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1">
                    {staffInfo.subject_id.map(subjectId => (
                      <div key={subjectId} className="text-sm text-gray-700 py-1 px-2 bg-gray-100 rounded">
                        {getSubjectById(subjectId)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No subjects assigned</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Subject Hours Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h2 className="text-2xl font-bold mb-2">Subject Hours</h2>
          <p className="text-gray-700">Set hours for each sub-subject</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : !staffInfo || !staffInfo.subject_id || staffInfo.subject_id.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subjects assigned. Please contact the administrator to assign subjects.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffInfo.subject_id.map(subjectId => {
                    const subject = subjects.find(s => s.id === subjectId);
                    if (!subject) return null;

                    // Calculate total subject hours
                    let totalSubjectHours = 0;
                    if (subject.sub_subjects && subject.sub_subjects.length > 0) {
                      totalSubjectHours = subject.sub_subjects.reduce((acc, currentSubSubject) => {
                        const hoursValue = editingHours[`${subject.id}-${currentSubSubject.id}`];
                        const currentHours = hoursValue !== undefined ? hoursValue : (currentSubSubject.hours || 0);
                        return acc + (Number(currentHours) || 0);
                      }, 0);
                    }
                    
                    return (
                      <React.Fragment key={subjectId}>
                        {subject.sub_subjects?.length ? (
                          <>
                            {subject.sub_subjects.map((subSubject, idx) => (
                              <tr key={`${subjectId}-${subSubject.id}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {idx === 0 && (
                                  <td rowSpan={subject.sub_subjects!.length} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top border-r">
                                    {subject.subject_name}
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {subSubject.sub_subject_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-20 px-2 py-1 border rounded focus:ring-blue-500 focus:border-blue-500"
                                    value={editingHours[`${subjectId}-${subSubject.id}`] !== undefined ? editingHours[`${subjectId}-${subSubject.id}`] : (subSubject.hours || '')}
                                    onChange={(e) => handleHoursChange(subjectId, subSubject.id, e.target.value)}
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-100 font-semibold">
                              <td className="px-6 py-3 text-right text-sm text-gray-700 border-r">Total Hours for {subject.subject_name}:</td>
                              <td colSpan={1} className="px-6 py-3 text-left text-sm text-gray-700">{/* Empty cell for alignment */}</td>
                              <td className="px-6 py-3 text-left text-sm text-gray-700">{totalSubjectHours}</td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr className="bg-white">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                                {subject.subject_name}
                              </td>
                              <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center italic">
                                No sub-subjects available
                              </td>
                            </tr>
                            <tr className="bg-gray-100 font-semibold">
                                <td className="px-6 py-3 text-right text-sm text-gray-700 border-r">Total Hours for {subject.subject_name}:</td>
                                <td colSpan={1} className="px-6 py-3 text-left text-sm text-gray-700">{/* Empty cell for alignment */}</td>
                                <td className="px-6 py-3 text-left text-sm text-gray-700">0</td>
                            </tr>
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Save All Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveAllHours}
                  disabled={saving || Object.keys(editingHours).length === 0}
                  className={`px-4 py-2 rounded-md text-white ${Object.keys(editingHours).length === 0 || saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
