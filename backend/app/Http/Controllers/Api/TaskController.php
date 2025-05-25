<?php

namespace App\Http\Controllers\Api;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\TaskResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\Validator;

class TaskController extends BaseController
{
    /**
     * Display a listing of the tasks.
     */
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details
        $instituteId = Auth::user()->staff->institute_id;
        
        // Get the current user's staff ID
        $staffId = Auth::user()->staff->id;
        
        // Start the query by filtering tasks based on the institute_id
        $query = Task::where('institute_id', $instituteId);
        
        // By default, only show tasks assigned to the logged-in staff member
        // Unless explicitly requesting all tasks with show_all=true parameter
        if (!$request->has('show_all') || $request->show_all !== 'true') {
            $query->where('assigned_to', $staffId);
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by priority if provided
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        
        // Filter by assigned_to if provided
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        
        // Filter by created_by if provided
        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }
        
        // Search by title or description if search term provided
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }
        
        // For backward compatibility - if my_tasks=false is explicitly set, show all tasks
        if ($request->has('my_tasks') && $request->my_tasks === 'false') {
            $query = Task::where('institute_id', $instituteId);
        }
        
        // Order by due date or created date
        if ($request->has('order_by')) {
            $orderBy = $request->order_by;
            $direction = $request->has('direction') ? $request->direction : 'asc';
            
            if (in_array($orderBy, ['due_date', 'created_at', 'priority', 'status'])) {
                $query->orderBy($orderBy, $direction);
            }
        } else {
            // Default ordering by created_at desc
            $query->orderBy('created_at', 'desc');
        }
        
        // Paginate the results
        $tasks = $query->with(['assignedTo', 'creator.user'])->paginate(10);
        
        return $this->sendResponse(
            [
                'tasks' => TaskResource::collection($tasks),
                'pagination' => [
                    'current_page' => $tasks->currentPage(),
                    'last_page' => $tasks->lastPage(),
                    'per_page' => $tasks->perPage(),
                    'total' => $tasks->total()
                ]
            ],
            'Tasks retrieved successfully'
        );
    }
    
    /**
     * Store a newly created task.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:low,medium,high',
            'assigned_to' => 'nullable|exists:staff,id',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled'
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }
        
        // Create new task
        $task = new Task();
        $task->institute_id = Auth::user()->staff->institute_id;
        $task->created_by = Auth::user()->staff->id;
        $task->title = $request->title;
        $task->description = $request->description;
        $task->due_date = $request->due_date;
        $task->priority = $request->priority ?? 'medium';
        $task->status = $request->status ?? 'pending';
        $task->assigned_to = $request->assigned_to;
        $task->save();
        
        // Load relationships
        $task->load(['assignedTo', 'creator']);
        
        return $this->sendResponse(
            ['task' => new TaskResource($task)],
            'Task created successfully'
        );
    }
    
    /**
     * Display the specified task.
     */
    public function show(string $id): JsonResponse
    {
        $task = Task::with(['assignedTo', 'creator.user'])->find($id);
        
        if (!$task) {
            return $this->sendError('Task not found', ['error' => 'Task not found'], 404);
        }
        
        // Check if task belongs to the user's institute
        if ($task->institute_id != Auth::user()->staff->institute_id) {
            return $this->sendError('Unauthorized', ['error' => 'You are not authorized to view this task'], 403);
        }
        
        return $this->sendResponse(
            ['task' => new TaskResource($task)],
            'Task retrieved successfully'
        );
    }
    
    /**
     * Update the specified task.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $task = Task::find($id);
        
        if (!$task) {
            return $this->sendError('Task not found', ['error' => 'Task not found'], 404);
        }
        
        // Check if task belongs to the user's institute
        if ($task->institute_id != Auth::user()->staff->institute_id) {
            return $this->sendError('Unauthorized', ['error' => 'You are not authorized to update this task'], 403);
        }
        
        // Validate request data
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:low,medium,high',
            'assigned_to' => 'nullable|exists:staff,id',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled'
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }
        
        // Update task
        if ($request->has('title')) {
            $task->title = $request->title;
        }
        
        if ($request->has('description')) {
            $task->description = $request->description;
        }
        
        if ($request->has('due_date')) {
            $task->due_date = $request->due_date;
        }
        
        if ($request->has('priority')) {
            $task->priority = $request->priority;
        }
        
        if ($request->has('status')) {
            $task->status = $request->status;
        }
        
        if ($request->has('assigned_to')) {
            $task->assigned_to = $request->assigned_to;
        }
        
        $task->save();
        
        // Load relationships
        $task->load(['assignedTo', 'creator.user']);
        
        return $this->sendResponse(
            ['task' => new TaskResource($task)],
            'Task updated successfully'
        );
    }
    
    /**
     * Update the status of a task.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $task = Task::find($id);
        
        if (!$task) {
            return $this->sendError('Task not found', ['error' => 'Task not found'], 404);
        }
        
        // Check if task belongs to the user's institute
        if ($task->institute_id != Auth::user()->staff->institute_id) {
            return $this->sendError('Unauthorized', ['error' => 'You are not authorized to update this task'], 403);
        }
        
        // Validate request data
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed,cancelled'
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }
        
        // Update task status
        $task->status = $request->status;
        $task->save();
        
        // Load relationships
        $task->load(['assignedTo', 'creator.user']);
        
        return $this->sendResponse(
            ['task' => new TaskResource($task)],
            'Task status updated successfully'
        );
    }
    
    /**
     * Remove the specified task.
     */
    public function destroy(string $id): JsonResponse
    {
        $task = Task::find($id);
        
        if (!$task) {
            return $this->sendError('Task not found', ['error' => 'Task not found'], 404);
        }
        
        // Check if task belongs to the user's institute
        if ($task->institute_id != Auth::user()->staff->institute_id) {
            return $this->sendError('Unauthorized', ['error' => 'You are not authorized to delete this task'], 403);
        }
        
        $task->delete();
        
        return $this->sendResponse([], 'Task deleted successfully');
    }
}
