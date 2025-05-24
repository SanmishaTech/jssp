import React from 'react';
import { Eye, PencilLine, Trash2, CheckCircle, HourglassIcon, Square } from 'lucide-react';

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
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onDelete,
  onEdit,
  onView,
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {task.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {task.assignee ? task.assignee.name : 'Unassigned'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {formatDate(task.due_date)}
                    {isOverdue(task.due_date, task.status) && (
                      <span className="ml-2 text-red-600 text-xs font-medium">Overdue</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Quick status change buttons */}
                    {task.status !== 'in_progress' && task.status !== 'completed' && (
                      <button
                        onClick={() => onStatusChange(task.id, 'in_progress')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Mark as in progress"
                      >
                        <HourglassIcon size={16} />
                      </button>
                    )}
                    
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => onStatusChange(task.id, 'completed')}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    
                    {task.status !== 'cancelled' && (
                      <button
                        onClick={() => onStatusChange(task.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                        title="Cancel task"
                      >
                        <Square size={16} />
                      </button>
                    )}
                    
                    {/* View details */}
                    <button
                      onClick={() => onView(task.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    
                    {/* Edit task */}
                    <button
                      onClick={() => onEdit(task)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Edit task"
                    >
                      <PencilLine size={16} />
                    </button>
                    
                    {/* Delete task */}
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
