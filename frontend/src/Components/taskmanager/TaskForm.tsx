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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time part for date comparison
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    
    // Due date validation
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.due_date);
      if (isNaN(selectedDate.getTime())) {
        newErrors.due_date = 'Invalid date format';
      } else if (selectedDate < currentDate) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }
    
    // Priority validation
    if (!['low', 'medium', 'high'].includes(formData.priority)) {
      newErrors.priority = 'Please select a valid priority';
    }
    
    // Assigned to validation (optional)
    if (formData.assigned_to !== null && 
        !staffMembers.some(staff => staff.id === formData.assigned_to)) {
      newErrors.assigned_to = 'Please select a valid staff member';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Use a ref to track if submission is already in progress
  const submitInProgressRef = React.useRef(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop any event bubbling
    
    // Double-check that submission is not already in progress
    if (isSubmitting || submitInProgressRef.current) {
      return;
    }
    
    // Set the ref to true immediately to prevent any race conditions
    submitInProgressRef.current = true;
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Wrap in a promise and add a small delay to prevent race conditions
      new Promise<void>(resolve => {
        // Small delay to ensure UI state is updated and prevent race conditions
        setTimeout(() => {
          try {
            onSubmit(formData);
            resolve();
          } catch (error) {
            console.error('Error submitting form:', error);
            resolve();
          }
        }, 50);
      }).finally(() => {
        // Reset both states after completion
        setTimeout(() => {
          setIsSubmitting(false);
          submitInProgressRef.current = false;
        }, 500);
      });
    } else {
      // If validation fails, reset the ref
      submitInProgressRef.current = false;
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
            maxLength={1000}
            className={errors.description ? "border-destructive" : ""}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description}</p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {formData.description.length}/1000 characters
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => {
                handleChange(e);
                // Clear error when a date is selected
                if (errors.due_date) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.due_date;
                    return newErrors;
                  });
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className={errors.due_date ? "border-destructive" : ""}
            />
            {errors.due_date && (
              <p className="text-destructive text-xs mt-1">{errors.due_date}</p>
            )}
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
                  // Clear error when a selection is made
                  if (errors.assigned_to) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.assigned_to;
                      return newErrors;
                    });
                  }
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
              {errors.assigned_to && (
                <p className="text-destructive text-xs mt-1">{errors.assigned_to}</p>
              )}
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
                  // Clear error when a selection is made
                  if (errors.priority) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.priority;
                      return newErrors;
                    });
                  }
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
              {errors.priority && (
                <p className="text-destructive text-xs mt-1">{errors.priority}</p>
              )}
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
          Cancel
        </Button>
        <Button
          type="submit"
          className="gap-2"
          disabled={isSubmitting}
          onClick={(e) => {
            // Handle button click directly
            if (isSubmitting) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }}
        >
          <Save className="h-4 w-4" /> {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'} Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
