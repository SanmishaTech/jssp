<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Get recent activities
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 50);
        $logName = $request->get('log_name');
        $causerId = $request->get('causer_id');
        $subjectType = $request->get('subject_type');
        $subjectId = $request->get('subject_id');

        $query = Activity::query();

        if ($logName) {
            $query->inLog($logName);
        }

        if ($causerId) {
            $query->where('causer_id', $causerId);
        }

        if ($subjectType) {
            $query->where('subject_type', $subjectType);
        }

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $activities = $query->with(['causer', 'subject'])
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
            'count' => $activities->count()
        ]);
    }

    /**
     * Get activities for a specific subject
     */
    public function getSubjectActivities(Request $request, string $subjectType, int $subjectId): JsonResponse
    {
        $limit = $request->get('limit', 50);
        
        $activities = Activity::where('subject_type', $subjectType)
            ->where('subject_id', $subjectId)
            ->with(['causer', 'subject'])
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
            'count' => $activities->count()
        ]);
    }

    /**
     * Get activities by causer (user)
     */
    public function getCauserActivities(Request $request, int $causerId): JsonResponse
    {
        $limit = $request->get('limit', 50);
        
        $activities = Activity::causedBy($causerId)
            ->with(['causer', 'subject'])
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
            'count' => $activities->count()
        ]);
    }

    /**
     * Get activities by log name
     */
    public function getLogActivities(Request $request, string $logName): JsonResponse
    {
        $limit = $request->get('limit', 50);
        
        $activities = Activity::inLog($logName)
            ->with(['causer', 'subject'])
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
            'count' => $activities->count()
        ]);
    }

    /**
     * Get activity statistics
     */
    public function getStats(): JsonResponse
    {
        $totalActivities = Activity::count();
        $todayActivities = Activity::whereDate('created_at', today())->count();
        $thisWeekActivities = Activity::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $thisMonthActivities = Activity::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count();

        $activitiesByLogName = Activity::selectRaw('log_name, count(*) as count')
            ->groupBy('log_name')
            ->get();

        $recentActivities = Activity::with(['causer', 'subject'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_activities' => $totalActivities,
                'today_activities' => $todayActivities,
                'this_week_activities' => $thisWeekActivities,
                'this_month_activities' => $thisMonthActivities,
                'activities_by_log_name' => $activitiesByLogName,
                'recent_activities' => $recentActivities
            ]
        ]);
    }

    /**
     * Clean old activities
     */
    public function cleanOldActivities(Request $request): JsonResponse
    {
        $days = $request->get('days', 90);
        $deletedCount = ActivityLogService::cleanOldActivities($days);

        return response()->json([
            'success' => true,
            'message' => "Deleted {$deletedCount} old activities (older than {$days} days)",
            'deleted_count' => $deletedCount
        ]);
    }

    /**
     * Get detailed activity
     */
    public function show(Activity $activity): JsonResponse
    {
        $activity->load(['causer', 'subject']);

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    /**
     * Delete activity
     */
    public function destroy(Activity $activity): JsonResponse
    {
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully'
        ]);
    }
}
