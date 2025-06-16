import React, { useEffect, useState, useMemo } from 'react';
import { useGetData } from '@/Components/HTTP/GET';
import { Combobox } from '@/components/ui/combobox';

interface SubjectHourRecord {
  subject_id: number;
  subject_name: string;
  sub_subject_id: number | null;
  sub_subject_name?: string;
  hours: number;
}

const Edittestcard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);
  const [subjectHours, setSubjectHours] = useState<SubjectHourRecord[]>([]);

  // Get role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) setRole(storedRole);
  }, []);

  // Fetch staff list (teaching staff only)
  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
  } = useGetData({
    endpoint: '/api/staff?role=teachingstaff',
    params: {
      queryKey: ['teachingStaff'],
      enabled: role === 'admin',
    },
  });

  useEffect(() => {
    if (!staffData) return;

    // Determine possible shapes of the payload
    let staffArray: any[] | null = null;

    if (Array.isArray(staffData)) {
      staffArray = staffData;
    } else if ((staffData as any).data && Array.isArray((staffData as any).data)) {
      staffArray = (staffData as any).data;
    } else if ((staffData as any).data?.Staff && Array.isArray((staffData as any).data.Staff)) {
      staffArray = (staffData as any).data.Staff;
    } else if ((staffData as any).data?.staff && Array.isArray((staffData as any).data.staff)) {
      staffArray = (staffData as any).data.staff;
    }

    if (staffArray) {
      // Ensure we only keep teachingstaff role entries
      const teachingStaff = staffArray.filter((s: any) => {
        const roleField = s.role || s.user?.role || '';
        return roleField === 'teachingstaff';
      });

      const opts = teachingStaff.map((s: any) => ({
        value: (s.id || s.staff_id || '').toString(),
        label: s.name || s.staff_name || 'Staff',
      }));
      setStaffOptions(opts);
      // auto-select first staff if none selected
      if (opts.length > 0 && selectedStaffId === null) {
        setSelectedStaffId(Number(opts[0].value));
      }
    } else {
      console.warn('Unexpected staffData structure:', staffData);
    }
  }, [staffData]);

  // Fetch subject hours for selected staff
  const {
    data: subjectHoursData,
    isLoading: subjectLoading,
    error: subjectError,
  } = useGetData({
    endpoint: `/api/staff-sub-subject-hours?staff_id=${selectedStaffId ?? ''}`,
    params: {
      queryKey: ['subjectHours', selectedStaffId],
      enabled: role === 'admin' && !!selectedStaffId,
    },
  });

  useEffect(() => {
    if (subjectHoursData && (subjectHoursData as any).data) {
      const subjects = (subjectHoursData as any).data.staff_assignments.subjects as any[];
      const flat: SubjectHourRecord[] = [];
      subjects.forEach((sub) => {
        if (sub.sub_subjects && sub.sub_subjects.length > 0) {
          sub.sub_subjects.forEach((ss: any) => {
            flat.push({
              subject_id: sub.id,
              subject_name: sub.name ?? sub.subject_name ?? 'Subject',
              sub_subject_id: ss.id,
              sub_subject_name: ss.name ?? ss.sub_subject_name ?? 'Sub Subject',
              hours: ss.hours ?? 0,
            });
          });
        } else {
          flat.push({
            subject_id: sub.id,
            subject_name: sub.name ?? sub.subject_name ?? 'Subject',
            sub_subject_id: null,
            hours: 0,
          });
        }
      });
      setSubjectHours(flat);
    }
  }, [subjectHoursData]);

  // Memoize grouped subject -> sub-subject structure to avoid recalculating on every render
  const groupedData = useMemo(() => {
    const map = new Map<number, {
      subject_id: number;
      subject_name: string;
      subject_hours: number;
      sub_subjects: { id: number; name?: string; hours: number }[];
    }>();

    subjectHours.forEach((rec) => {
      if (!map.has(rec.subject_id)) {
        map.set(rec.subject_id, {
          subject_id: rec.subject_id,
          subject_name: rec.subject_name,
          subject_hours: 0,
          sub_subjects: [],
        });
      }

      const entry = map.get(rec.subject_id)!;
      if (rec.sub_subject_id) {
        entry.sub_subjects.push({ id: rec.sub_subject_id, name: rec.sub_subject_name, hours: rec.hours });
      } else {
        entry.subject_hours = rec.hours;
      }
    });

    return Array.from(map.values());
  }, [subjectHours]);

  if (role !== 'admin' && role!== 'hod' && role !== 'viceprincipal' ) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-red-600">You do not have permission to view this page.</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Subject Hours Overview</h1>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Select Teaching Staff</label>
        {staffLoading ? (
          <div className="text-gray-500">Loading staff...</div>
        ) : staffError ? (
          <div className="text-red-500">Error loading staff list.</div>
        ) : (
          <Combobox
            options={staffOptions}
            value={selectedStaffId !== null ? selectedStaffId.toString() : ''}
            onValueChange={(val: string) => setSelectedStaffId(val ? Number(val) : null)}
            placeholder="Select staff"
          />
        )}
      </div>

      {selectedStaffId && (
        <div>
          {subjectLoading ? (
            <div className="text-gray-500">Loading subject hours...</div>
          ) : subjectError ? (
            <div className="text-red-500">Error loading subject hours.</div>
          ) : subjectHours.length === 0 ? (
            <div className="text-gray-500">No subject hours found for this staff.</div>
          ) : (
            <div className="space-y-4">
              {groupedData.map((subject) => (
                <div key={subject.subject_id} className="rounded-lg border shadow-sm overflow-hidden">
                  {/* Subject Header */}
                  <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
                    <h2 className="font-semibold text-gray-800 text-lg">
                      {subject.subject_name}
                    </h2>
                    <span className="text-sm font-medium text-gray-700">
                      {(
                        subject.sub_subjects.length > 0
                          ? subject.sub_subjects.reduce((sum, ss) => sum + ss.hours, 0)
                          : subject.subject_hours
                      )} hrs
                    </span>
                  </div>

                  {/* Sub-Subject List */}
                  {subject.sub_subjects.length > 0 && (
                    <table className="w-full text-sm">
                      
                      <tbody>
                        {subject.sub_subjects.map((ss, index) => (
                          <tr key={ss.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-700">{ss.name}</td>
                            <td className="px-4 py-2 text-right text-gray-600">{ss.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Edittestcard;
