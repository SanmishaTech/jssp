//@ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import AlertDialogbox from "./AlertBox";
import { Editor } from "primereact/editor";

// Letter data type
type Letter = {
  id: string;
  letter_number: string;
  letter_title: string;
  letter_description: string;
  created_at: string;
};

export default function LetterList() {
  // State for form fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLetters, setLoadingLetters] = useState<boolean>(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [userRole, setUserRole] = useState<string>("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLetters();
    getUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to run search when searchTerm changes
  useEffect(() => {
    // Reset to first page when search term changes
    setCurrentPage(1);
    // Don't call fetchLetters here - it will be called by the effect below
  }, [searchTerm]);
  
  // Effect to fetch letters when page or search changes
  useEffect(() => {
    fetchLetters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchLetters = async () => {
    setLoadingLetters(true);
    try {
      // Add search and pagination parameters
      const response = await axios.get(`/api/letters`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search: searchTerm,
          page: currentPage
        }
      });
      if (response.data?.status && response.data?.data) {
        setLetters(response.data.data.Letter || []);
        
        // Set pagination data
        if (response.data.data.Pagination) {
          // Don't update currentPage here, as it will cause an infinite loop
          // with the useEffect that watches currentPage
          setTotalPages(response.data.data.Pagination.last_page || 1);
        }
      } else {
        setLetters([]);
      }
    } catch (error) {
      console.error("Error fetching letters:", error);
      toast.error("Failed to load letters");
      setLetters([]);
    } finally {
      setLoadingLetters(false);
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
    if (!title?.trim() || !description?.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        letter_title: title,
        letter_description: description
      };

      if (editingId) {
        await axios.put(`/api/letters/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        toast.success("Letter updated successfully");
      } else {
        await axios.post(`/api/letters`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        toast.success("Letter sent successfully");
      }

      // Clear form after sending
      setTitle("");
      setDescription("");
      setEditingId(null);
      setViewMode(false);
      fetchLetters();
    } catch (error) {
      console.error("Error sending letter:", error);
      toast.error("Failed to send letter");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (letter: Letter) => {
    setEditingId(letter?.id || '');
    setTitle(letter?.letter_title || '');
    setDescription(letter?.letter_description || '');
    setViewMode(false);
  };
  
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsAlertOpen(true);
  };
  
  const toggleAlert = () => {
    setIsAlertOpen(!isAlertOpen);
  };

  const handleCreateNew = () => {
    setViewMode(false);
    setEditingId(null);
    setSelectedLetter(null);
    setTitle("");
    setDescription("");
  };

  return (
    <>
      <div className="flex h-screen overflow-auto mt-5 ">
        <div className="p-6 w-3/4 h-full bg-accent/60 mr-5 ml-5 rounded-lg shadow-lg">
          <div className="flex justify-center items-center p-3 mb-4">
            <h3 className="text-lg font-semibold">
              {viewMode ? 'View Letter' : (editingId ? 'Edit Letter' : 'Create New Letter')}
              {viewMode && (
                <>
                     <button 
                      onClick={() => handleEdit(selectedLetter)}
                      className="ml-4 px-2 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded"
                    >
                      Edit
                    </button>
                  
                  <button 
                    onClick={() => {
                      setViewMode(false);
                      setSelectedLetter(null);
                      setEditingId(null);
                      setTitle("");
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

          {viewMode && selectedLetter ? (
            <div className="space-y-4">
               <div className="text-xs text-gray-500 text-right pt-2">
                Created: {new Date(selectedLetter.created_at).toLocaleString()}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="view-title">Title:</Label>
                <div className="break-words whitespace-pre-wrap text-sm">
                  {selectedLetter.letter_title}
                </div>
              </div>
              
              <div className="grid gap-2">
                   <Label htmlFor="view-description">Description</Label>
                <div className="w-full bg-gray-50 min-h-[350px] overflow-auto whitespace-pre-wrap break-words text-sm" 
                     dangerouslySetInnerHTML={{ __html: selectedLetter.letter_description }} />
              </div>
            </div>
          ) : (
            <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter letter title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description">Description</Label>
                      <span className={`text-xs ${(description || '').length > 1350 ? (description || '').length >= 1500 ? 'text-red-500 font-semibold' : 'text-amber-500' : 'text-gray-500'}`}>
                        {(description || "").length} out of 1500 characters
                      </span>
                    </div>
                    <Editor
                        className="w-full"
                        value={description || ''}
                        onTextChange={(e) => setDescription(e.htmlValue || '')}
                        style={{ minHeight: "455px", maxHeight: "455px", width: "100%", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word", overflowY: "auto" }}
                      />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSend} disabled={loading}>
                      {loading ? 'Sending...' : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {editingId ? 'Update Letter' : 'Save Letter'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
            </>
          )}
        </div>
        {/* Right Sidebar */}
        <div className="p-3 w-1/4 bg-white">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Recent Letters</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 relative group"
                    onClick={handleCreateNew}
                    title="Create new letter"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-0 transform -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Create new letter
                    </span>
                  </Button>
              </div>
              
              {/* Search Box */}
              <div className="mt-3 mb-3">
                <Input
                  type="text"
                  placeholder="Search letters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="mt-3 space-y-2">
                {loadingLetters ? (
                  <p className="text-center text-sm text-gray-500">Loading letters...</p>
                ) : letters.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No letters found</p>
                ) : (
                  letters.map(letter => (
                    <div 
                      key={letter.id} 
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer group"
                      onClick={() => {
                        setViewMode(true);
                        setSelectedLetter(letter);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-[15px]">{(letter.letter_title || '').length > 30 ? `${(letter.letter_title || '').slice(0, 30)}...` : (letter.letter_title || '')}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(letter.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-3 items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              className="text-red-500 hover:text-red-700" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(letter.id);
                              }}
                              title="Delete letter"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Pagination controls */}
                {!loadingLetters && letters.length > 0 && totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        // fetchLetters() will be called by the useEffect
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
                        // fetchLetters() will be called by the useEffect
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
        fetchData={fetchLetters}
        backdrop="blur"
      />
    </>
  );
}
