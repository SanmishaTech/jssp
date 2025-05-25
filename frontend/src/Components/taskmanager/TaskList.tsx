import React from 'react';
import { PencilLine, Trash2, CheckCircle, HourglassIcon, Square } from 'lucide-react';

// Shadcn UI components
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Card, CardContent } from '../ui/card';

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

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onView: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  StatusBadge: React.FC<{ status: string }>;
  PriorityBadge: React.FC<{ priority: string }>;
  isAdmin: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onDelete,
  onEdit,
  onView,
  onStatusChange,
  StatusBadge,
  PriorityBadge,
  isAdmin
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <Card>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors" 
                  onClick={(e) => {
                    // Prevent row click when clicking on action buttons
                    if (e.currentTarget === e.target || !e.defaultPrevented) {
                      onView(task.id);
                    }
                  }}
                >
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {task.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {task.assignee ? task.creator_name : 'Unassigned'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={isOverdue(task.due_date, task.status) ? 'text-destructive font-medium' : ''}>
                      {formatDate(task.due_date)}
                      {isOverdue(task.due_date, task.status) && (
                        <span className="ml-2 text-destructive text-xs font-medium">Overdue</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <TooltipProvider>
                        {/* We use onPointerDown and preventDefault to prevent the row click handler from firing */}
                        {/* Quick status change buttons */}
                        {task.status !== 'in_progress' && task.status !== 'completed' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onStatusChange(task.id, 'in_progress');
                                }}
                                onPointerDown={(e) => e.preventDefault()}
                                className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                              >
                                <HourglassIcon size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark as in progress</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {task.status !== 'completed' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onStatusChange(task.id, 'completed');
                                }}
                                onPointerDown={(e) => e.preventDefault()}
                                className="h-8 w-8 text-green-600 hover:text-green-900 hover:bg-green-50"
                              >
                                <CheckCircle size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark as completed</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {task.status !== 'cancelled' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onStatusChange(task.id, 'cancelled');
                                }}
                                onPointerDown={(e) => e.preventDefault()}
                                className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                              >
                                <Square size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel task</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {/* The View details button is removed since the entire row is now clickable */}
                        
                        {/* Edit task - Only visible to admin */}
                        {/* {isAdmin && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(task)}
                                className="h-8 w-8 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                              >
                                <PencilLine size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit task</p>
                            </TooltipContent>
                          </Tooltip>
                        )} */}
                        
                        {/* Delete task - Only visible to admin */}
                        {/* {isAdmin && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(task.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete task</p>
                            </TooltipContent>
                          </Tooltip>
                        )} */}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
