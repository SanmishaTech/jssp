//@ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMemos();
    fetchStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to run search when searchTerm changes
  useEffect(() => {
    // Reset to first page when search term changes
    setCurrentPage(1);
    // Don't call fetchMemos here - it will be called by the effect below
  }, [searchTerm]);
  
  // Effect to fetch memos when page or search changes
  useEffect(() => {
    fetchMemos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchMemos = async () => {
    setLoadingMemos(true);
    try {
      // Add search and pagination parameters
      const response = await axios.get(`/api/memos`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search: searchTerm,
          page: currentPage
        }
      });
      if (response.data.status) {
        setMemos(response.data.data.Memo);
        
        // Set pagination data
        if (response.data.data.Pagination) {
          // Don't update currentPage here, as it will cause an infinite loop
          // with the useEffect that watches currentPage
          setTotalPages(response.data.data.Pagination.last_page);
        }
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
            <h3 className="text-lg font-semibold">
              {viewMode ? 'View Memo' : (editingId ? 'Edit Memo' : 'Create New Memo')}
              {viewMode && (
                <>
                  <button 
                    onClick={() => {
                      setViewMode(false);
                      setEditingId(selectedMemo.id);
                      setToStaff(selectedMemo.staff_id);
                      setSubject(selectedMemo.memo_subject);
                      setDescription(selectedMemo.memo_description);
                    }}
                    className="ml-4 px-2 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setViewMode(false);
                      setSelectedMemo(null);
                      setEditingId(null);
                      setToStaff("");
                      setSubject("");
                      setDescription("");
                    }}
                    className="ml-4 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Close
                  </button>
                </>
              )}
            </h3>
            
          </div>

          {viewMode && selectedMemo ? (
            <div className="space-y-4">
               <div className="text-xs text-gray-500 text-right pt-2">
                Created: {new Date(selectedMemo.created_at).toLocaleString()}
              </div>
               
              <div className="space-y-2">
                <Label htmlFor="view-staff">Staff: <span className="font-semibold text-[16px]">  {selectedMemo.staff_name}</span></Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="view-subject">Subject:</Label>
                <div className="break-words whitespace-pre-wrap text-sm">
                  {selectedMemo.memo_subject}
                </div>
              </div>
              
              <div className="grid gap-2">
                   <Label htmlFor="view-description">Description</Label>
                <div className="w-full bg-gray-50 min-h-[350px] overflow-auto whitespace-pre-wrap break-words text-sm">
                  {selectedMemo.memo_description}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to-staff">To Staff</Label>
                <Select value={toStaff} onValueChange={setToStaff}>
                  <SelectTrigger className="w-full" id="to-staff">
                    <SelectValue placeholder="Select staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description">Description</Label>
                  <span className={`text-xs ${description.length > 1350 ? description.length >= 1500 ? 'text-red-500 font-semibold' : 'text-amber-500' : 'text-gray-500'}`}>
                    {description.length} out of 1500 characters
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Enter memo description"
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 1500) {
                      setDescription(e.target.value);
                    }
                  }}
                  className="min-h-[350px]"
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
          )}
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
              
              {/* Search Box */}
              <div className="mt-3 mb-3">
                <Input
                  type="text"
                  placeholder="Search memos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="mt-3 space-y-2">
                {loadingMemos ? (
                  <p className="text-center text-sm text-gray-500">Loading memos...</p>
                ) : memos.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No memos found</p>
                ) : (
                  memos.map(memo => (
                    <div 
                      key={memo.id} 
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer group"
                      onClick={() => {
                        setViewMode(true);
                        setSelectedMemo(memo);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-[15px]">{memo.staff_name}</p>
                          <p className="text-xs text-gray-500">{memo.memo_subject.length > 11 ? `${memo.memo_subject.slice(0, 11)}...` : memo.memo_subject}</p>
                          <p className="text-xs text-gray-500">{memo.memo_description.length > 11 ? `${memo.memo_description.slice(0, 11)}...` : memo.memo_description}</p>
                          {/* <p className="text-xs text-gray-400 mt-1">
                            {moment(memo.created_at).format('MMM DD, YYYY')}
                          </p> */}
                        </div>
                        <div className="flex space-x-3 items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* <button 
                            className="text-gray-500 hover:text-blue-500" 
                            onClick={() => handleEdit(memo)}
                            title="Edit memo"
                          >
                            <Pencil className="h-5 w-5" />
                          </button> */}
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
                
                {/* Pagination controls */}
                {!loadingMemos && memos.length > 0 && totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        // fetchMemos() will be called by the useEffect
                      }}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => prev + 1);
                        // fetchMemos() will be called by the useEffect
                      }}
                    >
                      Next
                    </Button>
                  </div>
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
