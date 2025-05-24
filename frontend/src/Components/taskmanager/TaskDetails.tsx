import React from 'react';
import { PencilLine, Trash2, X, CalendarDays, User, CheckCircle, HourglassIcon, Square } from 'lucide-react';

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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {isOverdue(task.due_date, task.status) && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Overdue
            </span>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-line">
            {formatDescription(task.description)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center mb-2">
              <CalendarDays className="text-gray-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-500">Due Date</span>
            </div>
            <p className={`text-sm ${isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : 'text-gray-800'}`}>
              {formatDate(task.due_date)}
            </p>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <User className="text-gray-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-500">Assigned To</span>
            </div>
            <p className="text-sm text-gray-800">
              {task.assignee ? task.assignee.name : 'Unassigned'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <User className="text-gray-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-500">Created By</span>
            </div>
            <p className="text-sm text-gray-800">
              {task.creator ? task.creator.name : 'Unknown'}
            </p>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <CalendarDays className="text-gray-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-500">Created At</span>
            </div>
            <p className="text-sm text-gray-800">
              {formatDate(task.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200">
        <div className="space-x-2 mb-2 md:mb-0">
          <button
            onClick={() => onStatusChange(task.id, 'pending')}
            className={`px-3 py-1 text-xs font-medium rounded ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 cursor-default' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            disabled={task.status === 'pending'}
          >
            Pending
          </button>
          <button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className={`px-3 py-1 text-xs font-medium rounded ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 cursor-default' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            disabled={task.status === 'in_progress'}
          >
            <HourglassIcon className="inline-block mr-1" size={12} />
            In Progress
          </button>
          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            className={`px-3 py-1 text-xs font-medium rounded ${task.status === 'completed' ? 'bg-green-100 text-green-800 cursor-default' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            disabled={task.status === 'completed'}
          >
            <CheckCircle className="inline-block mr-1" size={12} />
            Completed
          </button>
          <button
            onClick={() => onStatusChange(task.id, 'cancelled')}
            className={`px-3 py-1 text-xs font-medium rounded ${task.status === 'cancelled' ? 'bg-red-100 text-red-800 cursor-default' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            disabled={task.status === 'cancelled'}
          >
            <Square className="inline-block mr-1" size={12} />
            Cancelled
          </button>
        </div>

        <div className="space-x-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center"
          >
            <PencilLine className="mr-2" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
          >
            <Trash2 className="mr-2" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
