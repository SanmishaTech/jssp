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
import { Send, Plus, Trash2 } from "lucide-react";
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
  const [userRole, setUserRole] = useState<string>("");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMemos();
    fetchStaffList();
    getUserRole();
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
  
  const getUserRole = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role || "");
      }
    } catch (error) {
      console.error("Error getting user role:", error);
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
      <div className="@container/memo min-w-0 w-full mt-5 px-4 pb-10 @[1100px]/memo:px-5">
        <div className="flex min-w-0 w-full flex-col gap-4 @[1100px]/memo:flex-row">
          <div className="@container min-w-0 w-full overflow-hidden rounded-lg bg-accent/60 p-4 shadow-lg @[700px]/memo:p-6 @[1100px]/memo:w-3/4">
            <div className="mb-4 flex min-w-0 flex-wrap items-center justify-center gap-2 p-3">
              <h3 className="text-center text-lg font-semibold">
                {viewMode
                  ? "View Memo"
                  : userRole === "admin" || userRole === "viceprincipal"
                    ? editingId
                      ? "Edit Memo"
                      : "Create New Memo"
                    : "Memo"}
              </h3>
              {viewMode && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  {(userRole === "admin" || userRole === "viceprincipal") && (
                    <button
                      onClick={() => {
                        setViewMode(false);
                        setEditingId(selectedMemo.id);
                        setToStaff(selectedMemo.staff_id);
                        setSubject(selectedMemo.memo_subject);
                        setDescription(selectedMemo.memo_description);
                      }}
                      className="rounded bg-blue-200 px-2 py-1 text-xs hover:bg-blue-300"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setViewMode(false);
                      setSelectedMemo(null);
                      setEditingId(null);
                      setToStaff("");
                      setSubject("");
                      setDescription("");
                    }}
                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

          {viewMode && selectedMemo ? (
            <div className="min-w-0 space-y-4">
               <div className="pt-2 text-right text-xs text-gray-500">
                Created: {new Date(selectedMemo.created_at).toLocaleString()}
              </div>
               
              <div className="min-w-0 space-y-2">
                <Label htmlFor="view-staff">Staff: <span className="break-words text-[16px] font-semibold">  {selectedMemo.staff_name}</span></Label>
              </div>
              
              <div className="min-w-0 space-y-2">
                <Label htmlFor="view-subject">Subject:</Label>
                <div className="break-words whitespace-pre-wrap text-sm">
                  {selectedMemo.memo_subject}
                </div>
              </div>
              
              <div className="grid min-w-0 gap-2">
                   <Label htmlFor="view-description">Description</Label>
                <div className="min-h-[200px] w-full min-w-0 overflow-auto whitespace-pre-wrap break-words bg-gray-50 text-sm @[700px]/memo:min-h-[350px]">
                  {selectedMemo.memo_description}
                </div>
              </div>
            </div>
          ) : (
            <>
              {(userRole === "admin" || userRole === "viceprincipal") ? (
                <div className="min-w-0 space-y-4">
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="to-staff">To Staff</Label>
                    <Select value={toStaff} onValueChange={setToStaff}>
                      <SelectTrigger className="w-full min-w-0" id="to-staff">
                        <SelectValue placeholder="Select staff member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter memo subject..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="min-w-0"
                    />
                  </div>
                  
                  <div className="grid min-w-0 gap-2">
                    <div className="flex min-w-0 flex-col gap-1 @sm:flex-row @sm:items-center @sm:justify-between">
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
                      className="min-h-[200px] min-w-0 @[700px]/memo:min-h-[350px]"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSend} disabled={loading} className="w-full @sm:w-auto">
                      {loading ? 'Sending...' : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {editingId ? 'Update Memo' : 'Send Memo'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[240px] items-center justify-center @[700px]/memo:h-[400px]">
                  <div className="rounded-lg bg-gray-50 p-6 text-center">
                    <h3 className="mb-2 text-lg font-medium text-gray-700">View Memo</h3>
                    <p className="text-gray-500">No Memo is Viewed</p>
                  </div>
                </div>
              )}
            </>
          )}
          </div>

          {/* Right sidebar — stacks below form when pane < 1100px */}
          <aside className="mb-8 min-w-0 w-full overflow-hidden rounded-lg bg-white p-3 shadow-lg @[1100px]/memo:mb-0 @[1100px]/memo:w-1/4">
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <h3 className="min-w-0 truncate font-medium">Recent Memos</h3>
                {(userRole === "admin" || userRole === "viceprincipal") && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-6 w-6 shrink-0 group"
                    onClick={() => {
                      setEditingId(null);
                      setToStaff("");
                      setSubject("");
                      setDescription("");
                      setViewMode(false);
                      setSelectedMemo(null);
                    }}
                    title="Create new memo"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="absolute left-0 -translate-x-full rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Create new memo
                    </span>
                  </Button>
                )}
              </div>
              
              {/* Search Box */}
              <div className="mb-3 mt-3 min-w-0">
                <Input
                  type="text"
                  placeholder="Search memos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-w-0"
                />
              </div>
              <div className="mt-3 min-w-0 space-y-2">
                {loadingMemos ? (
                  <p className="text-center text-sm text-gray-500">Loading memos...</p>
                ) : memos.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No memos found</p>
                ) : (
                  memos.map(memo => (
                    <div 
                      key={memo.id} 
                      className="group min-w-0 cursor-pointer rounded p-2 hover:bg-gray-100"
                      onClick={() => {
                        setViewMode(true);
                        setSelectedMemo(memo);
                      }}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate font-medium text-[15px]">{memo.staff_name}</p>
                          <p className="truncate text-xs text-gray-500">{memo.memo_subject}</p>
                          <p className="truncate text-xs text-gray-500">{memo.memo_description}</p>
                        </div>
                        <div className="mt-1.5 flex shrink-0 items-center space-x-3 opacity-100 transition-opacity @[1100px]/memo:opacity-0 @[1100px]/memo:group-hover:opacity-100">
                          {(userRole === "admin" || userRole === "viceprincipal") && (
                            <button 
                              className="text-red-500 hover:text-red-700" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(memo.id);
                              }}
                              title="Delete memo"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Pagination controls */}
                {!loadingMemos && memos.length > 0 && totalPages > 1 && (
                  <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
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
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          </aside>
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
