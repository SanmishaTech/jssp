//@ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import AlertDialogbox from "./AlertBox";
// import moment from "moment";

// Memo data type
type Memo = {
  id: string;
  staff_id: string;
  memo_subject: string;
  memo_description: string;
  created_at: string;
};

export default function MemoList() {
  // State for form fields
  const [toStaff, setToStaff] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMemos, setLoadingMemos] = useState<boolean>(true);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<{id: string, name: string}[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>("");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMemos();
    fetchStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMemos = async () => {
    setLoadingMemos(true);
    try {
      const response = await axios.get(`/api/memos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.status) {
        setMemos(response.data.data.Memo);
      }
    } catch (error) {
      console.error("Error fetching memos:", error);
      toast.error("Failed to load memos");
    } finally {
      setLoadingMemos(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`/api/all_staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.status) {
        setStaffList(response.data.data.Staff);
      }
    } catch (error) {
      console.error("Error fetching staff list:", error);
    }
  };

  const handleSend = async () => {
    if (!subject || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        staff_id: toStaff,
        memo_subject: subject,
        memo_description: description
      };

      if (editingId) {
        await axios.put(`/api/memos/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        toast.success("Memo updated successfully");
      } else {
        await axios.post(`/api/memos`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        toast.success("Memo sent successfully");
      }

      // Clear form after sending
      setToStaff("");
      setSubject("");
      setDescription("");
      setEditingId(null);
      fetchMemos();
    } catch (error) {
      console.error("Error sending memo:", error);
      toast.error("Failed to send memo");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setToStaff(memo.staff_id);
    setSubject(memo.memo_subject);
    setDescription(memo.memo_description);
  };
  
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsAlertOpen(true);
  };
  
  const toggleAlert = () => {
    setIsAlertOpen(!isAlertOpen);
  };

  return (
    <>
      <div className="flex h-full">
        <div className="p-6 w-3/4 h-full bg-accent/60 mr-5 ml-5 rounded-lg shadow-lg">
          <div className="flex justify-center items-center p-3 mb-4">
            <h3 className="text-lg font-semibold">{editingId ? 'Edit Memo' : 'Create New Memo'}</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to-staff">To Staff</Label>
              <select
                id="to-staff"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={toStaff}
                onChange={(e) => setToStaff(e.target.value)}
              >
                <option value="">Select staff member...</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter memo subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter memo content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSend} disabled={loading}>
                {loading ? 'Sending...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {editingId ? 'Update Memo' : 'Send Memo'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-1/4 p-4 bg-white">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Recent Memos</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 relative group"
                  onClick={() => {
                    setEditingId(null);
                    setToStaff("");
                    setSubject("");
                    setDescription("");
                  }}
                  title="Create new memo"
                >
                  <Plus className="h-4 w-4" />
                  <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-0 transform -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Create new memo
                  </span>
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {loadingMemos ? (
                  <p className="text-center text-sm text-gray-500">Loading memos...</p>
                ) : memos.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No memos found</p>
                ) : (
                  memos.map(memo => (
                    <div key={memo.id} className="p-2 hover:bg-gray-100 rounded cursor-pointer group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{memo.memo_subject}</p>
                          <p className="text-xs text-gray-500 truncate">{memo.memo_description}</p>
                          {/* <p className="text-xs text-gray-400 mt-1">
                            {moment(memo.created_at).format('MMM DD, YYYY')}
                          </p> */}
                        </div>
                        <div className="flex space-x-3 items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="text-gray-500 hover:text-blue-500" 
                            onClick={() => handleEdit(memo)}
                            title="Edit memo"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700" 
                            onClick={() => handleDelete(memo.id)}
                            title="Delete memo"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialogbox
        url={deleteId}
        isOpen={isAlertOpen}
        onOpen={toggleAlert}
        fetchData={fetchMemos}
        backdrop="blur"
      />
    </>
  );
}
