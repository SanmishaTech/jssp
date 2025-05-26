import React from 'react';
import { PencilLine, Trash2, X, CalendarDays, User, CheckCircle, HourglassIcon, Square } from 'lucide-react';

// Shadcn UI components
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: number, status: string) => void;
  StatusBadge: React.FC<{ status: string }>;
  PriorityBadge: React.FC<{ priority: string }>;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  StatusBadge,
  PriorityBadge
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format description with line breaks
  const formatDescription = (description: string) => {
    if (!description) return 'No description provided';
    
    return description.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Check if due date is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'completed' || status === 'cancelled') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    
    return taskDueDate < today;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{task.title}</h2>
       
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {isOverdue(task.due_date, task.status) && (
            <Badge variant="destructive">Overdue</Badge>
          )}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6 ">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <div className="text-sm whitespace-pre-line break-all">
              {formatDescription(task.description)}
            </div>


          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center mb-1 text-muted-foreground">
              <CalendarDays className="mr-2" size={16} />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p className={`text-sm ${isOverdue(task.due_date, task.status) ? 'text-destructive font-medium' : ''}`}>
              {formatDate(task.due_date)}
            </p>
          </div>
          <div>
            <div className="flex items-center mb-1 text-muted-foreground">
              <User className="mr-2" size={16} />
              <span className="text-sm font-medium">Created By</span>
            </div>
            <p className="text-sm">
              {task.creator ? task.creator.name : 'Unknown'}
            </p>
          </div>
          <div>
            <div className="flex items-center mb-1 text-muted-foreground">
              <CalendarDays className="mr-2" size={16} />
              <span className="text-sm font-medium">Created At</span>
            </div>
            <p className="text-sm">
              {formatDate(task.created_at)}
            </p>
          </div>


        </div>

         

        
         
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onStatusChange(task.id, 'pending')}
            variant="outline"
            size="sm"
            disabled={task.status === 'pending'}
            className={task.status === 'pending' ? 'bg-yellow-300 border-yellow-200 text-black' : ''}
          >
            Pending
          </Button>
          <Button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            variant="outline"
            size="sm"
            disabled={task.status === 'in_progress'}
            className={task.status === 'in_progress' ? 'bg-blue-400 border-blue-200 text-black' : ''}
          >
            <HourglassIcon className="mr-1 h-3 w-3" />
            In Progress
          </Button>
          <Button
            onClick={() => onStatusChange(task.id, 'completed')}
            variant="outline"
            size="sm"
            disabled={task.status === 'completed'}
            className={task.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Button>
          <Button
            onClick={() => onStatusChange(task.id, 'cancelled')}
            variant="outline"
            size="sm"
            disabled={task.status === 'cancelled'}
            className={task.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' : ''}
          >
            <Square className="mr-1 h-3 w-3" />
            Cancelled
          </Button>
        </div>

        {/* <div className="flex items-center space-x-2">
          <Button
            onClick={onEdit}
            variant="outline"
            className="gap-1"
          >
            <PencilLine className="h-4 w-4" /> Edit
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default TaskDetails;
