<?php

namespace App\Services;

use Spatie\Activitylog\Models\Activity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ActivityLogService
{
    /**
     * Log a custom activity
     */
    public static function log(string $description, Model $subject = null, array $properties = [], string $logName = 'default'): Activity
    {
        $activity = activity($logName)
            ->withProperties($properties)
            ->log($description);

        if ($subject) {
            $activity->subject()->associate($subject);
            $activity->save();
        }

        return $activity;
    }

    /**
     * Log user login activity
     */
    public static function logLogin($user, Request $request = null): Activity
    {
        $properties = [];
        
        if ($request) {
            $properties = [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_time' => now(),
            ];
        }

        return self::log('User logged in', $user, $properties, 'auth');
    }

    /**
     * Log user logout activity
     */
    public static function logLogout($user): Activity
    {
        return self::log('User logged out', $user, ['logout_time' => now()], 'auth');
    }

    /**
     * Log bulk operations
     */
    public static function logBulkOperation(string $operation, array $subjects, array $properties = []): Activity
    {
        $subjectTypes = collect($subjects)->map(fn($subject) => get_class($subject))->unique()->implode(', ');
        $count = count($subjects);
        
        return self::log(
            "Bulk {$operation} performed on {$count} {$subjectTypes} records",
            null,
            array_merge($properties, [
                'operation' => $operation,
                'subject_count' => $count,
                'subject_types' => $subjectTypes,
                'subject_ids' => collect($subjects)->pluck('id')->toArray(),
            ]),
            'bulk'
        );
    }

    /**
     * Log file operations
     */
    public static function logFileOperation(string $operation, string $fileName, Model $subject = null, array $additionalProperties = []): Activity
    {
        $properties = array_merge([
            'file_name' => $fileName,
            'file_operation' => $operation,
            'timestamp' => now(),
        ], $additionalProperties);

        return self::log(
            "File {$operation}: {$fileName}",
            $subject,
            $properties,
            'file'
        );
    }

    /**
     * Log export operations
     */
    public static function logExport(string $exportType, string $format, int $recordCount = null): Activity
    {
        $properties = [
            'export_type' => $exportType,
            'format' => $format,
            'exported_at' => now(),
        ];

        if ($recordCount !== null) {
            $properties['record_count'] = $recordCount;
        }

        return self::log(
            "Exported {$exportType} data in {$format} format",
            null,
            $properties,
            'export'
        );
    }

    /**
     * Log import operations
     */
    public static function logImport(string $importType, string $fileName, int $recordCount = null, array $errors = []): Activity
    {
        $properties = [
            'import_type' => $importType,
            'file_name' => $fileName,
            'imported_at' => now(),
            'has_errors' => !empty($errors),
        ];

        if ($recordCount !== null) {
            $properties['record_count'] = $recordCount;
        }

        if (!empty($errors)) {
            $properties['errors'] = $errors;
        }

        return self::log(
            "Imported {$importType} data from {$fileName}",
            null,
            $properties,
            'import'
        );
    }

    /**
     * Get activities for a specific subject
     */
    public static function getActivitiesForSubject(Model $subject, int $limit = 50)
    {
        return Activity::forSubject($subject)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get activities by causer (user who performed the action)
     */
    public static function getActivitiesByCauser(Model $causer, int $limit = 50)
    {
        return Activity::causedBy($causer)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get activities by log name
     */
    public static function getActivitiesByLogName(string $logName, int $limit = 50)
    {
        return Activity::inLog($logName)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent activities
     */
    public static function getRecentActivities(int $limit = 50)
    {
        return Activity::latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Clean old activities (older than specified days)
     */
    public static function cleanOldActivities(int $days = 90): int
    {
        return Activity::where('created_at', '<', now()->subDays($days))->delete();
    }
}
