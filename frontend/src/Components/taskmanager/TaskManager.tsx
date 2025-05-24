import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Plus, PencilLine, Trash2, Filter, Search, ClipboardList, CheckCircle, Hourglass } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';

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

interface StaffMember {
  id: number;
  name: string;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/tasks?page=${currentPage}`;
      
      // Add filters to URL if they exist
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      if (filterPriority !== 'all') url += `&priority=${filterPriority}`;
      if (filterAssignee) url += `&assigned_to=${filterAssignee}`;
      if (myTasksOnly) url += `&my_tasks=true`;
      
      const response = await axios.get(url);
      setTasks(response.data.data.tasks);
      setTotalPages(response.data.data.pagination.last_page);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff members for assignment
  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/all_staff`);
      setStaffMembers(response.data.data.Staff);
    } catch (err) {
      console.error('Error fetching staff members:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStaffMembers();
  }, [currentPage, searchTerm, filterStatus, filterPriority, filterAssignee, myTasksOnly]);

  // Create new task
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, taskData);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  // Update existing task
  const handleUpdateTask = async (taskId: number, taskData: Partial<Task>) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`, taskData);
      setShowForm(false);
      setIsEditing(false);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  // Update task status
  const handleStatusUpdate = async (taskId: number, status: string) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${taskId}/status`, { status });
      fetchTasks();
      if (currentTask && currentTask.id === taskId) {
        // If details are open, refresh the current task
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`);
        setCurrentTask(response.data.data.task);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`);
        fetchTasks();
        if (showDetails && currentTask && currentTask.id === taskId) {
          setShowDetails(false);
          setCurrentTask(null);
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  // View task details
  const handleViewTask = async (taskId: number) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`);
      setCurrentTask(response.data.data.task);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details. Please try again.');
    }
  };

  // Edit task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditing(true);
    setShowForm(true);
  };

  // Reset form
  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentTask(null);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchTasks();
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterAssignee(null);
    setMyTasksOnly(false);
    setCurrentPage(1);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = 'text-white';
    
    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-500';
        break;
      case 'in_progress':
        bgColor = 'bg-blue-500';
        break;
      case 'completed':
        bgColor = 'bg-green-500';
        break;
      case 'cancelled':
        bgColor = 'bg-red-500';
        break;
      default:
        bgColor = 'bg-gray-500';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    let bgColor = '';
    let textColor = 'text-white';
    
    switch (priority) {
      case 'low':
        bgColor = 'bg-green-500';
        break;
      case 'medium':
        bgColor = 'bg-yellow-500';
        textColor = 'text-gray-800';
        break;
      case 'high':
        bgColor = 'bg-red-500';
        break;
      default:
        bgColor = 'bg-gray-500';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ClipboardList className="mr-2" /> Task Manager
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setCurrentTask(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2" /> Add New Task
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <Filter className="mr-2" /> Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-2 rounded-r hover:bg-blue-700"
              >
                <Search />
              </button>
            </form>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              value={filterAssignee || ''}
              onChange={(e) => setFilterAssignee(e.target.value ? Number(e.target.value) : null)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">All Staff</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* My Tasks Toggle */}
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={myTasksOnly}
              onChange={() => setMyTasksOnly(!myTasksOnly)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Show only my tasks</span>
          </label>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div>
          <TaskList
            tasks={tasks}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onView={handleViewTask}
            onStatusChange={handleStatusUpdate}
            StatusBadge={StatusBadge}
            PriorityBadge={PriorityBadge}
          />
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Previous
              </button>
              
              <span className="mx-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <ClipboardList className="inline-block text-4xl mb-2" />
            <p className="text-xl">No tasks found</p>
          </div>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee || myTasksOnly
              ? 'Try adjusting your filters or search term to find what you\'re looking for.'
              : 'Get started by creating your first task.'}
          </p>
          {!(searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee || myTasksOnly) && (
            <button
              onClick={() => {
                setShowForm(true);
                setIsEditing(false);
                setCurrentTask(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
            >
              <Plus className="mr-2" /> Create Task
            </button>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <TaskForm
              onSubmit={isEditing && currentTask ? (data) => handleUpdateTask(currentTask.id, data) : handleCreateTask}
              onCancel={handleCancelForm}
              initialData={currentTask || undefined}
              staffMembers={staffMembers}
              isEditing={isEditing}
            />
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showDetails && currentTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <TaskDetails
              task={currentTask}
              onClose={() => setShowDetails(false)}
              onEdit={() => {
                setShowDetails(false);
                handleEditTask(currentTask);
              }}
              onDelete={() => {
                setShowDetails(false);
                handleDeleteTask(currentTask.id);
              }}
              onStatusChange={handleStatusUpdate}
              StatusBadge={StatusBadge}
              PriorityBadge={PriorityBadge}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
