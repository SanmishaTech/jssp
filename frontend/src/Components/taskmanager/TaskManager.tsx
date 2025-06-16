import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, ClipboardList } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // We'll display any errors in the UI if they occur
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Check if user is admin
  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    // Grant elevated permissions to admin and viceprincipal roles
    setIsAdmin(userRole === 'admin' || userRole === 'viceprincipal' );
  }, []);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Using relative API path
      console.log('Using relative API path');
      
      let url = `/api/tasks?page=${currentPage}`;
      
      // Add filters to URL if they exist
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      if (filterPriority !== 'all') url += `&priority=${filterPriority}`;
      if (filterAssignee) url += `&assigned_to=${filterAssignee}`;
      
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      
      // Handle the response based on the API structure
      if (response.data && response.data.data) {
        setTasks(response.data.data.tasks || []);
        setTotalPages(response.data.data.pagination?.last_page || 1);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setError('Unexpected API response structure. Please contact support.');
        setTasks([]);
        setTotalPages(1);
      }
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
      const response = await axios.get('/api/all_staff');
      setStaffMembers(response.data.data.Staff);
    } catch (err) {
      console.error('Error fetching staff members:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStaffMembers();
  }, [currentPage, searchTerm, filterStatus, filterPriority, filterAssignee]);

  // Create new task
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('/api/tasks', taskData);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing task
  const handleUpdateTask = async (taskId: number, taskData: Partial<Task>) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await axios.put(`/api/tasks/${taskId}`, taskData);
      setShowForm(false);
      setIsEditing(false);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task status
  const handleStatusUpdate = async (taskId: number, status: string) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status });
      fetchTasks();
      if (currentTask && currentTask.id === taskId) {
        // If details are open, refresh the current task
        const response = await axios.get(`/api/tasks/${taskId}`);
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
        await axios.delete(`/api/tasks/${taskId}`);
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
      const response = await axios.get(`/api/tasks/${taskId}`);
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
    // Reset submission state when canceling
    setIsSubmitting(false);
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
    setCurrentPage(1);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let variant = '';
    let label = '';
    
    switch (status) {
      case 'pending':
        variant = 'warning';
        label = 'Pending';
        break;
      case 'in_progress':
        variant = 'secondary';
        label = 'In Progress';
        break;
      case 'completed':
        variant = 'success';
        label = 'Completed';
        break;
      case 'cancelled':
        variant = 'outline';
        label = 'Cancelled';
        break;
      default:
        variant = 'default';
        label = status;
    }
    
    return (
      <Badge variant={variant as "default" | "secondary" | "destructive" | "outline" | "warning" | "success"}>
        {label}
      </Badge>
    );
  };

  // Priority badge component
  const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    let variant = '';
    let label = '';
    
    switch (priority) {
      case 'low':
        variant = 'success';
        label = 'Low';
        break;
      case 'medium':
        variant = 'default';
        label = 'Medium';
        break;
      case 'high':
        variant = 'destructive';
        label = 'High';
        break;
      default:
        variant = 'outline';
        label = priority;
    }
    
    return (
      <Badge variant={variant as "default" | "secondary" | "destructive" | "outline" | "warning" | "success"}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Task Manager</h1>
          <p className="text-gray-600">Create, assign, and track tasks</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setCurrentTask(null);
            }}
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 w-full"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label className="whitespace-nowrap">Status:</Label>
                <Select 
                  value={filterStatus} 
                  onValueChange={(value) => setFilterStatus(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label className="whitespace-nowrap">Priority:</Label>
                <Select 
                  value={filterPriority} 
                  onValueChange={(value) => setFilterPriority(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Label className="whitespace-nowrap">Assignee:</Label>
                  <Select 
                    value={filterAssignee?.toString() || 'all'} 
                    onValueChange={(value) => setFilterAssignee(value === 'all' ? null : Number(value))}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                variant="outline"
                onClick={resetFilters}
                size="sm"
                className="h-10"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Task List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
            isAdmin={isAdmin}
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
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee
              ? 'Try adjusting your filters or search term to find what you\'re looking for.'
              : 'Get started by creating your first task.'}
          </p>
          {!(searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee) && (
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
      <Dialog 
        open={showForm} 
        onOpenChange={(open: boolean) => {
          if (!open) handleCancelForm();
          setShowForm(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={isEditing && currentTask ? (data) => handleUpdateTask(currentTask.id, data) : handleCreateTask}
            onCancel={handleCancelForm}
            initialData={currentTask || undefined}
            staffMembers={staffMembers}
            isEditing={isEditing}
          />
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      <Dialog 
        open={showDetails && !!currentTask} 
        onOpenChange={(open: boolean) => {
          if (!open) setShowDetails(false);
          else setShowDetails(true);
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-white">
          {currentTask && (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManager;
