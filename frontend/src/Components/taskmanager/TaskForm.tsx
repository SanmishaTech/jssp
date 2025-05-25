import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

// Shadcn UI components
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

interface Task {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: number | null;
}

interface StaffMember {
  id: number;
  name: string;
}

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  initialData?: Task;
  staffMembers: StaffMember[];
  isEditing: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  staffMembers,
  isEditing
}) => {
  const [formData, setFormData] = useState<Task>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        due_date: initialData.due_date || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'pending',
        assigned_to: initialData.assigned_to || null
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'assigned_to' ? (value ? Number(value) : null) : value
    }));
    
    // Clear error for this field when user makes a change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.due_date && new Date(formData.due_date) < new Date()) {
      newErrors.due_date = 'Due date cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
              className={errors.due_date ? "border-destructive" : ""}
            />
            {errors.due_date && <p className="text-destructive text-xs mt-1">{errors.due_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select 
              name="assigned_to" 
              value={formData.assigned_to?.toString() || 'none'} 
              onValueChange={(value: string) => {
                const e = { 
                  target: { 
                    name: 'assigned_to', 
                    value: value === 'none' ? '' : value 
                  } 
                } as React.ChangeEvent<HTMLSelectElement>;
                handleChange(e);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a staff member</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              name="priority" 
              value={formData.priority} 
              onValueChange={(value: string) => {
                const e = { 
                  target: { 
                    name: 'priority', 
                    value: value 
                  } 
                } as React.ChangeEvent<HTMLSelectElement>;
                handleChange(e);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isEditing && (
          <div>
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select 
              name="status" 
              value={formData.status} 
              onValueChange={(value: string) => {
                const e = { 
                  target: { 
                    name: 'status', 
                    value: value 
                  } 
                } as React.ChangeEvent<HTMLSelectElement>;
                handleChange(e);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="h-4 w-4" /> Cancel
        </Button>
        <Button
          type="submit"
          className="gap-2"
        >
          <Save className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'} Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
