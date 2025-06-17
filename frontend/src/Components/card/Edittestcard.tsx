import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useGetData } from '@/Components/HTTP/GET';
import { toast } from 'sonner';

type Division = {
  id: number;
  division: string;
};

type Student = {
  id: number;
  student_name: string;
  division_name: string;
  id_card_issued: boolean;
};

const Edittestcard: React.FC = () => {
  const queryClient = useQueryClient();
  const [divisionId, setDivisionId] = useState<string>('');

  /* ----------------------------- fetch divisions ---------------------------- */
  const divisionsQuery = useGetData({
    endpoint: '/api/all_divisions',
    params: {
      queryKey: ['divisions'],
    },
  });

  /* ------------------------------ fetch students --------------------------- */
  const studentsQuery = useGetData({
    endpoint: divisionId ? `/api/all_students?division_id=${divisionId}` : '/api/all_students',
    params: {
      queryKey: ['students', divisionId],
      enabled: divisionsQuery.isSuccess, // wait for token etc
    },
  });

  // Memoised parsed data
  const divisions: Division[] = React.useMemo(() => {
    if (divisionsQuery.isSuccess && divisionsQuery.data) {
      try {
        // backend wraps result { Division: [..] }
        // @ts-ignore
        const payload = (divisionsQuery.data as any).data?.Division ?? [];
        return payload as Division[];
      } catch {
        return [];
      }
    }
    return [];
  }, [divisionsQuery.data, divisionsQuery.isSuccess]);

  const students: Student[] = React.useMemo(() => {
    if (studentsQuery.isSuccess && studentsQuery.data) {
      // @ts-ignore
      return (studentsQuery.data as any).data?.Student ?? [];
    }
    return [];
  }, [studentsQuery.data, studentsQuery.isSuccess]);

  // mutation to toggle id card status
  const toggleMutation = useMutation({
    mutationFn: async (payload: { id: number; issued: boolean }) => {
      const res = await fetch(`/api/students/${payload.id}/id-card`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ id_card_issued: payload.issued }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success('ID card status updated');
      queryClient.invalidateQueries({ queryKey: ['students', divisionId] });
    },
    onError: (e: any) => toast.error(e.message ?? 'Update failed'),
  });

  const handleCheckbox = (student: Student, value?: boolean) => {
    toggleMutation.mutate({ id: student.id, issued: typeof value === 'boolean' ? value : !student.id_card_issued });
  };


  /* --------------------------------- render -------------------------------- */
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">ID Card Issuance</h2>
        <Select value={divisionId || 'all'} onValueChange={(v) => setDivisionId(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.division}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded shadow border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Division</th>
              <th className="px-4 py-2 text-center">
  <div className="flex flex-col items-center gap-1">
    <span className="font-semibold">ID Card Issued</span>
    <button
      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-gray-100 rounded-full px-3 py-1 hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      disabled={students.length === 0 || toggleMutation.isPending}
      onClick={() => {
        const allIssued = students.every((stu) => stu.id_card_issued);
        students.forEach((stu) => {
          if (stu.id_card_issued !== !allIssued) {
            handleCheckbox(stu, !allIssued);
          }
        });
      }}
      title={students.every((stu) => stu.id_card_issued) ? 'Unselect all students' : 'Select all students'}
    >
      <svg viewBox="0 0 16 16" fill="none" width="14" height="14" className="inline align-middle" aria-hidden="true"><path d="M4 8.5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {students.every((stu) => stu.id_card_issued) ? 'Unselect All' : 'Select All'}
    </button>
  </div>
</th>
            </tr>
          </thead>
          <tbody>
            {studentsQuery.isLoading && (
              <tr>
                <td colSpan={3} className="text-center p-2">
                  Loading...
                </td>
              </tr>
            )}
            {!studentsQuery.isLoading && students.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-2">
                  No students found
                </td>
              </tr>
            )}
            {students.map((stu) => (
              <tr key={stu.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-medium text-gray-800">{stu.student_name}</td>
                <td className="px-4 py-2 text-gray-700">{stu.division_name}</td>
                <td className="px-4 py-2 text-center">
                  <Checkbox
                    checked={stu.id_card_issued}
                    onCheckedChange={() => handleCheckbox(stu)}
                    disabled={toggleMutation.isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Edittestcard;
