//@ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Mock data type
type Memo = {
  id: string;
  title: string;
  content: string;
};

export default function MemoList() {
  // State for form fields
  const [toStaff, setToStaff] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  
  // Mock data for recent memos
  const [memos, setMemos] = useState<Memo[]>([
    { id: '1', title: 'Meeting Schedule', content: 'Updated meeting schedule for next week' },
    { id: '2', title: 'Curriculum Changes', content: 'New curriculum changes for next semester' },
    { id: '3', title: 'Staff Training', content: 'Mandatory staff training scheduled for Friday' },
  ]);

  const handleSend = () => {
    console.log('Sending memo:', { toStaff, subject, description });
    // Here you would normally send the data to your backend
    
    // Clear form after sending
    setToStaff("");
    setSubject("");
    setDescription("");
  };

  return (
    <div className="flex h-full">
        <div className="p-6 w-3/4 h-full bg-accent/60 mr-5 ml-5 rounded-lg shadow-lg">
          <div className="flex justify-center items-center p-3 mb-4">
            <h3 className="text-lg font-semibold">Create New Memo</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to-staff">To Staff</Label>
              <Input
                id="to-staff"
                placeholder="Select staff members..."
                value={toStaff}
                onChange={(e) => setToStaff(e.target.value)}
              />
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
              <Button onClick={handleSend}>
                <Send className="mr-2 h-4 w-4" />
                Send Memo
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
                  onClick={() => console.log('Compose new memo')}
                  title="Compose new memo"
                >
                  <Plus className="h-4 w-4" />
                  <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-0 transform -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Compose new memo
                  </span>
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {memos.map(memo => (
                  <div key={memo.id} className="p-2 hover:bg-gray-100 rounded cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{memo.title}</p>
                        <p className="text-xs text-gray-500 truncate">{memo.content}</p>
                      </div>
                      <div className="flex space-x-3 items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="text-gray-500 hover:text-blue-500" 
                          onClick={() => console.log('Edit memo', memo.id)}
                          title="Edit memo"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700" 
                          onClick={() => console.log('Delete memo', memo.id)}
                          title="Delete memo"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
