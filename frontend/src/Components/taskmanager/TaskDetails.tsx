import React from 'react';
import { CalendarDays, User, CheckCircle, HourglassIcon, Square } from 'lucide-react';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

function TaskDetails({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  StatusBadge,
  PriorityBadge,
}: TaskDetailsProps) {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDescription = (description: string) => {
    if (!description || description.trim() === '') {
      return 'No description provided.';
    }
    return description;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);

    return taskDueDate < today;
  };

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="min-w-0 break-words text-xl font-bold">{task.title}</h2>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="space-y-4">
        {isOverdue(task.due_date, task.status) && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">Overdue</Badge>
          </div>
        )}

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <div className="break-all whitespace-pre-line text-sm">
              {formatDescription(task.description)}
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center text-muted-foreground">
              <CalendarDays className="mr-2" size={16} />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p
              className={`text-sm ${
                isOverdue(task.due_date, task.status)
                  ? 'font-medium text-destructive'
                  : ''
              }`}
            >
              {formatDate(task.due_date)}
            </p>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center text-muted-foreground">
              <User className="mr-2" size={16} />
              <span className="text-sm font-medium">Created By</span>
            </div>
            <p className="text-sm">
              {task.creator ? task.creator.name : 'Unknown'}
            </p>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center text-muted-foreground">
              <CalendarDays className="mr-2" size={16} />
              <span className="text-sm font-medium">Created At</span>
            </div>
            <p className="text-sm">{formatDate(task.created_at)}</p>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onStatusChange(task.id, 'pending')}
            variant="outline"
            size="sm"
            disabled={task.status === 'pending'}
            className={
              task.status === 'pending'
                ? 'border-yellow-200 bg-yellow-300 text-black'
                : ''
            }
          >
            Pending
          </Button>
          <Button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            variant="outline"
            size="sm"
            disabled={task.status === 'in_progress'}
            className={
              task.status === 'in_progress'
                ? 'border-blue-200 bg-blue-400 text-black'
                : ''
            }
          >
            <HourglassIcon className="mr-1 h-3 w-3" />
            In Progress
          </Button>
          <Button
            onClick={() => onStatusChange(task.id, 'completed')}
            variant="outline"
            size="sm"
            disabled={task.status === 'completed'}
            className={
              task.status === 'completed'
                ? 'border-green-200 bg-green-50 text-green-700'
                : ''
            }
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Button>
          <Button
            onClick={() => onStatusChange(task.id, 'cancelled')}
            variant="outline"
            size="sm"
            disabled={task.status === 'cancelled'}
            className={
              task.status === 'cancelled'
                ? 'border-red-200 bg-red-50 text-red-700'
                : ''
            }
          >
            <Square className="mr-1 h-3 w-3" />
            Cancelled
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;
