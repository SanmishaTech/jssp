import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface SubjectHoursFormProps {
  onSaveComplete?: () => void;
}

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
  sub_subject?: SubSubject[];
}

interface SubSubject {
  id: number;
  sub_subject_name: string;
  hours?: number;
}

export default function SubjectHoursForm({ onSaveComplete }: SubjectHoursFormProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingHours, setEditingHours] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<boolean>(false);
  
  const token = localStorage.getItem("token");

  // Fetch subject hours and staff assignments
  useEffect(() => {
    const fetchData = async () => {
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
          
          // Update the reference data collections
          if (response.data.data.staff_assignments.courses.length > 0) {
            setCourses(response.data.data.staff_assignments.courses);
          }
          
          if (response.data.data.staff_assignments.semesters.length > 0) {
            setSemesters(response.data.data.staff_assignments.semesters);
          }
          
          if (response.data.data.staff_assignments.subjects.length > 0) {
            setSubjects(response.data.data.staff_assignments.subjects);
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

    fetchData();
  }, [token]);

  // Handler for changing hours
  const handleHoursChange = (subjectId: number, subSubjectId: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setEditingHours(prev => ({
      ...prev,
      [`${subjectId}-${subSubjectId}`]: numValue
    }));
  };

  // Save all hours
  const saveAllHours = async () => {
    if (Object.keys(editingHours).length === 0) {
      alert('No changes to save.');
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
      
      // Call API to save all hours at once
      await axios.post('/api/staff-sub-subject-hours/batch', {
        updates
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear all editing states
      setEditingHours({});
      
      // Show success message
      alert('All hours saved successfully!');
      
      // Call the callback if provided
      if (onSaveComplete) {
        onSaveComplete();
      }
      
    } catch (error) {
      console.error('Error saving hours:', error);
      alert('Failed to save hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-blue-50">
        <h2 className="text-2xl font-bold mb-2">Subject Hours Assignment</h2>
        <p className="text-gray-700">Assign hours to each sub-subject</p>
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
                {subjects.map(subject => {
                  if (!subject.sub_subject?.length) {
                    return (
                      <tr key={subject.id} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subject.subject_name}
                        </td>
                        <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          No sub-subjects available
                        </td>
                      </tr>
                    );
                  }
                  
                  return subject.sub_subject.map((subSubject, idx) => (
                    <tr key={`${subject.id}-${subSubject.id}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {idx === 0 && (
                        <td rowSpan={subject.sub_subject?.length} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
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
                          value={editingHours[`${subject.id}-${subSubject.id}`] ?? subSubject.hours ?? ''}
                          onChange={(e) => handleHoursChange(subject.id, subSubject.id, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
            
            {/* Save All Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveAllHours}
                disabled={saving || Object.keys(editingHours).length === 0}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  Object.keys(editingHours).length === 0 || saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
