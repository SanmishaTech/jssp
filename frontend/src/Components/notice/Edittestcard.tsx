import React, { useState, useEffect, useMemo } from 'react';
import { useGetData } from '@/Components/HTTP/GET';
import { usePostData } from '@/Components/HTTP/POST';
import { useQueryClient } from '@tanstack/react-query';
import { Combobox } from '@/Components/ui/combobox';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/Components/ui/alert-dialog';

interface Notice {
  id: number;
  sender_staff_id: number | null;
  sender_role: string;
  recipient_staff_id: number | null;
  recipient_role: string | null;
  recipient_institute_id?: number | null;
  message: string;
  created_at: string;
  seen_by?: string[];
}

interface StaffOption {
  value: string;
  label: string;
  role: string;
}

const rolesList = [
  'teachingstaff',
  'nonteachingstaff',
  'cashier',
  'admission',
  'backoffice',
  'accountant',
  'admin',
];

const NoticeChat: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);

  const [selectedRole, setSelectedRole] = useState<string>(''); // for admin selecting role
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>('');
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);

  const [message, setMessage] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null); // dialog state

  // Load role and staffId from localStorage
  useEffect(() => {
    setRole(localStorage.getItem('role'));
    const id = localStorage.getItem('staff_id');
    if (id) setStaffId(Number(id));
  }, []);

  // Fetch existing notices
  const { data: noticesData, isLoading: noticesLoading } = useGetData({
    endpoint: '/api/notices',
    params: { queryKey: ['notices'] },
  });

  // Fetch staff list (for dropdowns)
  const { data: staffData } = useGetData({
    endpoint: '/api/staff',
    params: {
      queryKey: ['allStaff'],
      enabled: role === 'admin',
    },
  });

  // Fetch institutes list for superadmin
  const { data: institutesData } = useGetData({
    endpoint: '/api/institutes',
    params: {
      queryKey: ['allInstitutes'],
      enabled: role === 'superadmin',
    },
  });

  // Normalize institutes list
  const instituteList = useMemo<any[]>(() => {
    if (!institutesData) return [];
    // If plain array
    if (Array.isArray(institutesData)) return institutesData as any[];
    // If {data: {Institutes: [...]}}
    if (Array.isArray((institutesData as any).data?.Institutes)) return (institutesData as any).data.Institutes;
    // If {data: [...]} 
    if (Array.isArray((institutesData as any).data)) return (institutesData as any).data;
    // If {data: {data: [...]}}
    if (Array.isArray((institutesData as any).data?.data)) return (institutesData as any).data.data;
    // If {institutes: [...]}
    if (Array.isArray((institutesData as any).institutes)) return (institutesData as any).institutes;
    return [];
  }, [institutesData]);

  // Normalize staff list
  const staffList = useMemo<any[]>(() => {
    if (!staffData) return [];
    if (Array.isArray(staffData)) return staffData as any[];
    if (Array.isArray((staffData as any).data?.Staff)) return (staffData as any).data.Staff;
    if (Array.isArray((staffData as any).data?.staffs)) return (staffData as any).data.staffs;
    if (Array.isArray((staffData as any).data)) return (staffData as any).data;
    return [];
  }, [staffData]);

  useEffect(() => {
    if (role === 'admin' && staffList.length) {
      const options = staffList.map((staff: any) => ({
        value: String(staff.id),
        label: staff.staff_name || staff.user?.name || `Staff ${staff.id}`,
        role: staff.role,
      }));
      setStaffOptions(options);
    }
  }, [role, staffList]);

  const queryClient = useQueryClient();

  const { mutate: sendNotice, isPending } = usePostData({
    endpoint: '/api/notices',
    params: {
      onSuccess: () => {
        toast.success('Notice sent');
        setMessage('');
        queryClient.invalidateQueries({ queryKey: ['notices'] });
      },
      onError: () => toast.error('Failed to send notice'),
    },
  });

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Type a message');
      return;
    }

    const payload: any = {
      message,
    };

    if (role === 'superadmin') {
      if (!selectedInstituteId) {
        toast.error('Please select an institute');
        return;
      }
      payload.recipient_institute_id = Number(selectedInstituteId);
      payload.recipient_role = 'admin';
    } else if (role === 'admin') {
      if (!selectedRole && !selectedStaffId) {
        toast.error('Select role or staff');
        return;
      }
      if (selectedStaffId) payload.recipient_staff_id = Number(selectedStaffId);
      else payload.recipient_role = selectedRole;
    }

    sendNotice(payload);
  };

  // Transform notices for display
  const noticeItems: Notice[] = (() => {
    if (!noticesData) return [];
    if ((noticesData as any).data) return (noticesData as any).data as Notice[];
    if (Array.isArray(noticesData)) return noticesData as Notice[];
    return [];
  })();

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Sidebar for admin role selection */}
      {role === 'admin' && (
        <aside className="w-full md:w-72 border-r p-4 space-y-4 bg-gray-50">
          <h2 className="font-semibold text-lg">Send To</h2>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <Combobox
              options={rolesList.map((r) => ({ value: r, label: r }))}
              value={selectedRole}
              onValueChange={(v) => {
                setSelectedRole(v);
                setSelectedStaffId('');
              }}
              placeholder="Select role"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Staff</label>
            <Combobox
              options={staffOptions
                .filter((opt) => (selectedRole ? opt.role === selectedRole : true))
                .map(({ value, label }) => ({ value, label }))}
              value={selectedStaffId}
              onValueChange={setSelectedStaffId}
              placeholder="Select staff (optional)"
              disabled={!selectedRole && staffOptions.length === 0}
            />
          </div>
        </aside>
      )}

      {/* Sidebar for superadmin institute selection */}
      {role === 'superadmin' && (
        <aside className="w-full md:w-72 border-r p-4 space-y-4 bg-gray-50">
          <h2 className="font-semibold text-lg">Select Institute</h2>
          <Combobox
            options={instituteList.map((inst: any) => ({ value: String(inst.id), label: inst.institute_name ?? inst.name ?? `Institute ${inst.id}` }))}
            value={selectedInstituteId}
            onValueChange={setSelectedInstituteId}
            placeholder="Choose institute"
          />
        </aside>
      )}

      {/* Main chat area */}
      <section className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
          {noticesLoading && <p>Loading...</p>}
          {!noticesLoading && noticeItems.length === 0 && <p className="text-center text-gray-500">No messages yet</p>}
          {noticeItems.map((notice) => (
            <div
              key={notice.id}
              className={`mx-auto w-full max-w-xl bg-white border rounded p-3 shadow cursor-pointer hover:bg-gray-50`}
              onClick={() => {
                if (role === 'admin' || role === 'superadmin') {
                  setSelectedNotice(notice);
                }
              }}
            >
              {/* Sender role */}
              <p className="text-xs font-semibold text-blue-600 mb-1">
                {notice.sender_role ? `From: ${notice.sender_role}` : 'From: Unknown'}
              </p>
              <p className="font-medium break-words whitespace-pre-wrap">{notice.message}</p>
              {/* Timestamp */}
              <p className="text-xs text-gray-500 text-right mt-1">{new Date(notice.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        {/* Input */}
        {(role === 'admin' || role === 'superadmin') ? (
          <div className="p-4 border-t bg-white flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isPending}>
              Send
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t bg-white text-sm text-gray-500 text-center">
            You can view notices here. Only admins can send messages.
          </div>
        )}
      </section>
      {/* Dialog for notice details */}
      {selectedNotice && (
        <AlertDialog open={true} onOpenChange={(open) => !open && setSelectedNotice(null)}>
          <AlertDialogContent className='bg-white'>
            <AlertDialogHeader>
              <AlertDialogTitle>Notice Details</AlertDialogTitle>
              <AlertDialogDescription>
                Sent on {new Date(selectedNotice.created_at).toLocaleString()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Roles information */}
              <div className="text-sm text-gray-600 space-x-2">
                <span className="font-semibold">From:</span> {selectedNotice.sender_role || 'Unknown'}
                {selectedNotice.recipient_role && (
                  <>
                    <span className="font-semibold ml-4">To:</span> {selectedNotice.recipient_role}
                  </>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words">{selectedNotice.message}</p>
              <div>
                <p className="font-semibold mb-1">Seen by:</p>
                {selectedNotice.seen_by && selectedNotice.seen_by.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNotice.seen_by.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No one has seen this notice yet.</p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default NoticeChat;