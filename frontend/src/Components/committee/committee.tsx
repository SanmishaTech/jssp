import React, { useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { useGetData } from "@/Components/HTTP/GET";

export default function Committee() {
  const params = useParams({ strict: false }) as { id: string };
  const { id } = params;

  const committeeQuery = useGetData({
    endpoint: `/api/committee/${id}`,
    params: { queryKey: ["committee", id], enabled: !!id },
  });

  const committee = useMemo(() => {
    if (committeeQuery.data && (committeeQuery.data as any).data?.Committee) {
      return (committeeQuery.data as any).data.Committee;
    }
    return null;
  }, [committeeQuery.data]);
  if (committeeQuery.isLoading) return <div>Loading...</div>;
  if (committeeQuery.isError) return <div>Error loading committee</div>;

  if (!committee) return <div>No data</div>;

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {committee.commitee_name?.charAt(0) || "C"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {committee.commitee_name}
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Institute: <span className="font-medium">{committee.institute_name}</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Committee Members</h2>
          <table className="min-w-full bg-white dark:bg-slate-800 border rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Staff Name</th>
                <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Designation</th>
              </tr>
            </thead>
            <tbody>
              {committee.staff && committee.staff.length > 0 ? (
                committee.staff.map((s: any) => (
                  <tr key={s.staff_name ?? s.staff_id} className="hover:bg-blue-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-2 border-b">{s.staff_name ?? s.staff_id}</td>
                    <td className="px-4 py-2 border-b">{s.role ?? '-'}</td>
                    <td className="px-4 py-2 border-b">{s.designation}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-gray-500">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
