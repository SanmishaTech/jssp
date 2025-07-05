//@ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Trash2, Download, Paperclip, BookOpen, Inbox } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import axios from "axios";
import { toast } from "sonner";
import AlertDialogbox from "./AlertBox";
import { Editor } from "primereact/editor";

// Letter data type
type Letter = {
  id: string;
  letter_number: string;
  letter_title: string;
  type: "inward" | "outward";
  letter_description: string;
  letter_path?: string;
  letter_url?: string;
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
  const [letterType, setLetterType] = useState<"inward" | "outward">("outward");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [userRole, setUserRole] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteFile, setDeleteFile] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<"all" | "inward" | "outward">("all");
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
  
  // Add this useEffect after the existing searchTerm useEffect
  useEffect(() => {
    // Reset to first page when filter type changes
    setCurrentPage(1);
  }, [filterType]);
  
  // Effect to fetch letters when page or search changes
  useEffect(() => {
    fetchLetters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterType]);

  const fetchLetters = async () => {
    setLoadingLetters(true);
    try {
      // Build params object
      const params: any = {
        search: searchTerm,
        page: currentPage
      };
      
      // Add type filter if not "all"
      if (filterType !== "all") {
        params.type = filterType;
      }
      
      const response = await axios.get(`/api/letters`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
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
    if (!title?.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (letterType === "outward" && !description?.trim()) {
      toast.error("Please enter a description for outward letter");
      return;
    }

    if (letterType === "inward" && !selectedFile && !editingId) {
      toast.error("Please attach a file for inward letter");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('letter_title', title);
      formData.append('type', letterType);

      if (letterType === "outward") {
        formData.append('letter_description', description);
      }
      
      if (selectedFile) {
        formData.append('letter_file', selectedFile);
      }
      
      if (deleteFile) {
        formData.append('delete_file', '1');
      }

      if (editingId) {
        await axios.post(`/api/letters/${editingId}?_method=PUT`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        toast.success("Letter updated successfully");
      } else {
        await axios.post(`/api/letters`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        toast.success("Letter sent successfully");
      }

      // Clear form after sending
      setTitle("");
      setDescription("");
      setEditingId(null);
      setViewMode(false);
      setSelectedFile(null);
      setDeleteFile(false);
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
    setLetterType(letter?.type || 'outward');
    setViewMode(false);
    setSelectedFile(null);
    setDeleteFile(false);
  };
  
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsAlertOpen(true);
  };
  
  const toggleAlert = () => {
    setIsAlertOpen(!isAlertOpen);
  };

  const handleDownloadPdf = async (letterId: string) => {
    if (!letterId) return;
    setIsDownloading(true);
    try {
      const response = await axios.get(`/api/letters/${letterId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
      toast.success("PDF opened in a new tab.");
    } catch (error) {
      console.error("Error opening PDF:", error);
      toast.error("Failed to open PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateNew = () => {
    setViewMode(false);
    setEditingId(null);
    setSelectedLetter(null);
    setTitle("");
    setDescription("");
    setLetterType("outward");
    setSelectedFile(null);
    setDeleteFile(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file (PDF, JPG, PNG, DOC, DOCX)');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleViewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <>
      <div className="flex h-screen overflow-auto mt-5 ">
        <div className="p-6 w-3/4 h-full bg-accent/60 mr-5 ml-5 rounded-lg shadow-lg">
          <div className="flex justify-center items-center p-3 mb-4">
            <h3 className="text-lg font-semibold">
                  {viewMode ? 'View Letter' : (editingId ? 'Edit Letter' : (letterType === 'inward' ? 'Create Inward Letter' : 'Create Outward Letter'))}
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
            <div className="space-y-6">
              {/* Header Section */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedLetter.letter_title}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selectedLetter.type === 'inward' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedLetter.type === 'inward' ? (
                          <><Inbox className="h-3 w-3 mr-1" /> Inward Letter</>
                        ) : (
                          <><BookOpen className="h-3 w-3 mr-1" /> Outward Letter</>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">
                        Letter #{selectedLetter.letter_number}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Created on</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedLetter.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(selectedLetter.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              {selectedLetter.type === 'outward' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700">Letter Content</h3>
                  </div>
                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <div className="text-gray-700 leading-relaxed" 
                         style={{ fontSize: '0.95rem', lineHeight: '1.7' }}
                         dangerouslySetInnerHTML={{ __html: selectedLetter.letter_description }} />
                  </div>
                </div>
              ) : (
                selectedLetter.letter_url && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-700">Attached Document</h3>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Paperclip className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Letter Attachment</p>
                            <p className="text-sm text-gray-500">Click to view the attached document</p>
                          </div>
                        </div>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleViewFile(selectedLetter.letter_url!)}
                          className="flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" />
                          View Document
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
              
              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {selectedLetter.type === 'outward' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPdf(selectedLetter.id)}
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
                <Tabs value={letterType} onValueChange={(value) => {
                  setLetterType(value as 'inward' | 'outward');
                  // Clear file when switching to outward
                  if (value === 'outward') {
                    setSelectedFile(null);
                    setDeleteFile(false);
                  }
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="outward" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Outward Letter
                    </TabsTrigger>
                    <TabsTrigger value="inward" className="flex items-center gap-2">
                      <Inbox className="h-4 w-4" />
                      Inward Letter
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter letter title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <TabsContent value="outward" className="space-y-4">
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
                          style={{ minHeight: "355px", maxHeight: "355px", width: "100%", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word", overflowY: "auto" }}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="inward" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">Attach File (Required)</Label>
                        <Input
                          id="file"
                          name="file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileChange}
                          className="file:mr-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {selectedFile && (
                          <p className="text-xs text-gray-500">Selected: {selectedFile.name}</p>
                        )}
                      </div>
                      
                      {editingId && (
                        <div className="space-y-2">
                          <Label>Current File:</Label>
                          <div className="flex items-center gap-2">
                            {letters.find(l => l.id === editingId)?.letter_url ? (
                              <>
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  onClick={() => handleViewFile(letters.find(l => l.id === editingId)!.letter_url!)}
                                >
                                  View Current File
                                </Button>
                                <Label className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={deleteFile}
                                    onChange={(e) => setDeleteFile(e.target.checked)}
                                  />
                                  <span>Delete current file</span>
                                </Label>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">No file attached</span>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
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
                </Tabs>
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
              
              {/* Filter Buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setFilterType("all")}
                  className={`flex-1 px-2 py-1 text-xs rounded ${filterType === "all" ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("outward")}
                  className={`flex-1 px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${filterType === "outward" ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  <BookOpen className="h-3 w-3" />
                  Outward
                </button>
                <button
                  onClick={() => setFilterType("inward")}
                  className={`flex-1 px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${filterType === "inward" ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  <Inbox className="h-3 w-3" />
                  Inward
                </button>
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
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-xs text-gray-500">{letter.type === 'inward' ? 'Inward' : 'Outward'}</span>
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-[15px]">{((letter.letter_title || '').length > 30 ? `${(letter.letter_title || '').slice(0, 30)}...` : (letter.letter_title || ''))}</p>
                                
                              </div>
                            </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(letter.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-3 items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {letter.letter_url ? (
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewFile(letter.letter_url!);
                                }}
                                title="View Attachment"
                              >
                                <Paperclip className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPdf(letter.id);
                                }}
                                title="Download PDF"
                                disabled={isDownloading}
                              >
                                <Download className="h-5 w-5" />
                              </button>
                            )}
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
