# Activity Log Implementation Guide

## Overview

This project now includes comprehensive activity logging using the `spatie/laravel-activitylog` package. This system automatically tracks changes to your models and provides tools for custom logging.

## Features Implemented

1. **Automatic Model Logging**: User, Student, and Staff models automatically log changes
2. **Custom Activity Service**: Helper methods for specific logging scenarios
3. **REST API Endpoints**: Retrieve and manage activity logs
4. **Middleware Integration**: Automatically sets authenticated user as causer
5. **Console Commands**: Clean old activity logs
6. **Comprehensive Filtering**: Filter activities by user, model, log type, etc.

## Model Configuration

### Models with Activity Logging

The following models have been configured with activity logging:

#### User Model
- Logs: name, email changes
- Description: "User {event}"
- Auto-logs: created, updated, deleted

#### Student Model
- Logs: student_name, prn, abcId, division_id, institute_id, id_card_issued
- Description: "Student {event}"
- Auto-logs: created, updated, deleted

#### Staff Model
- Logs: All attributes except updated_at
- Description: "Staff {event}"
- Auto-logs: created, updated, deleted

### Adding Activity Logging to New Models

To add activity logging to a new model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class YourModel extends Model
{
    use LogsActivity;

    // Your existing model code...

    /**
     * Get the activity log options for this model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['field1', 'field2', 'field3']) // Specify which fields to log
            ->logOnlyDirty() // Only log changed fields
            ->dontSubmitEmptyLogs() // Don't create logs if nothing changed
            ->setDescriptionForEvent(fn(string $eventName) => "YourModel {$eventName}");
    }
}
```

## Custom Activity Logging

### Using the ActivityLogService

The `ActivityLogService` provides helper methods for common logging scenarios:

#### Basic Custom Logging
```php
use App\Services\ActivityLogService;

ActivityLogService::log(
    'Custom activity description',
    $model, // Optional - the subject model
    ['key' => 'value'], // Optional - additional properties
    'custom_log_name' // Optional - log category
);
```

#### User Authentication Logging
```php
// Log user login
ActivityLogService::logLogin($user, $request);

// Log user logout
ActivityLogService::logLogout($user);
```

#### File Operations
```php
ActivityLogService::logFileOperation('upload', 'document.pdf', $student, [
    'file_size' => 1024000,
    'file_type' => 'application/pdf'
]);
```

#### Import/Export Operations
```php
// Log import
ActivityLogService::logImport('students', 'students.xlsx', 150, $errors);

// Log export
ActivityLogService::logExport('students', 'pdf', 200);
```

#### Bulk Operations
```php
ActivityLogService::logBulkOperation('delete', $students, [
    'criteria' => 'division_id = 1'
]);
```

### In Controllers

Example implementation in a controller:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Services\ActivityLogService;
use App\Http\Controllers\Controller;

class YourController extends Controller
{
    public function store(Request $request)
    {
        $model = YourModel::create($request->validated());
        
        // Custom logging with additional context
        ActivityLogService::log(
            "New {$model->name} created via API",
            $model,
            [
                'api_endpoint' => $request->path(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ],
            'api_operations'
        );
        
        return response()->json($model);
    }
    
    public function destroy($id)
    {
        $model = YourModel::findOrFail($id);
        
        // Log before deletion (model will be gone after delete)
        ActivityLogService::log(
            "Deleted {$model->name}",
            $model,
            [
                'deleted_id' => $model->id,
                'deleted_name' => $model->name
            ],
            'api_operations'
        );
        
        $model->delete();
        
        return response()->json(['message' => 'Deleted successfully']);
    }
}
```

## API Endpoints

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity-logs` | Get paginated activity logs with filters |
| GET | `/api/activity-logs/stats` | Get activity statistics |
| GET | `/api/activity-logs/subject/{type}/{id}` | Get activities for specific model |
| GET | `/api/activity-logs/causer/{userId}` | Get activities by user |
| GET | `/api/activity-logs/log/{logName}` | Get activities by log category |
| GET | `/api/activity-logs/{activityId}` | Get specific activity details |
| DELETE | `/api/activity-logs/{activityId}` | Delete specific activity |
| DELETE | `/api/activity-logs/clean` | Clean old activities |

### Query Parameters

For the main `/api/activity-logs` endpoint:

- `limit` - Number of records to return (default: 50)
- `log_name` - Filter by log category
- `causer_id` - Filter by user who caused the activity
- `subject_type` - Filter by model type (e.g., "App\Models\Student")
- `subject_id` - Filter by specific model ID

### Example API Calls

```bash
# Get recent activities
GET /api/activity-logs?limit=20

# Get activities for a specific student
GET /api/activity-logs/subject/App\Models\Student/123

# Get activities by a specific user
GET /api/activity-logs/causer/5

# Get student management activities
GET /api/activity-logs/log/student_management

# Get activity statistics
GET /api/activity-logs/stats

# Clean activities older than 30 days
DELETE /api/activity-logs/clean?days=30
```

## Log Categories

The system uses different log categories for organization:

- `default` - Standard model changes
- `auth` - Authentication activities
- `student_management` - Student-related operations
- `staff_management` - Staff-related operations
- `file` - File operations
- `import` - Data import operations
- `export` - Data export operations
- `bulk` - Bulk operations
- `api_operations` - API-specific operations

## Console Commands

### Clean Old Activities

```bash
# Clean activities older than 90 days (default)
php artisan activity-log:clean

# Clean activities older than 30 days
php artisan activity-log:clean --days=30
```

## Configuration

The activity log configuration is located in `config/activitylog.php`. Key settings:

```php
return [
    'enabled' => env('ACTIVITY_LOGGER_ENABLED', true),
    'delete_records_older_than_days' => 365,
    'default_log_name' => 'default',
    'default_auth_driver' => null,
    'subject_returns_soft_deleted_models' => false,
    'activity_model' => \Spatie\Activitylog\Models\Activity::class,
];
```

## Database Structure

Activities are stored in the `activity_log` table with the following key fields:

- `id` - Primary key
- `log_name` - Category/type of activity
- `description` - Human-readable description
- `subject_type` - Model class name
- `subject_id` - Model ID
- `causer_type` - User model class (usually App\Models\User)
- `causer_id` - User ID who caused the activity
- `properties` - JSON field with additional data
- `created_at` - When the activity occurred

## Best Practices

1. **Use meaningful descriptions**: Write clear, human-readable descriptions
2. **Include relevant context**: Add properties that provide useful context
3. **Use appropriate log categories**: Organize activities with meaningful log names
4. **Log before deletion**: Always log deletion activities before calling delete()
5. **Don't over-log**: Only log important business activities, not every minor change
6. **Clean old logs**: Regularly clean old activity logs to maintain performance
7. **Protect sensitive data**: Be careful not to log sensitive information in properties

## Performance Considerations

1. **Indexing**: The activity_log table has indexes on commonly queried fields
2. **Cleanup**: Use the cleanup command regularly to remove old logs
3. **Selective logging**: Use `logOnly()` to limit which fields are tracked
4. **Batch operations**: For bulk operations, use custom logging instead of individual model logs

## Troubleshooting

### Common Issues

1. **Activities not showing causer**: Ensure the ActivityLogMiddleware is properly registered
2. **No activities logged**: Check if the model has the LogsActivity trait
3. **Performance issues**: Check if you need to clean old activities or add database indexes
4. **Missing descriptions**: Ensure getActivitylogOptions() method is implemented

### Debugging

Enable activity logging debug mode in your `.env`:

```env
ACTIVITY_LOGGER_ENABLED=true
LOG_LEVEL=debug
```

Check the Laravel logs for activity logging related messages.

## Examples in Your Project

The system is already implemented in your StudentController with examples of:

- Automatic logging via model traits
- Custom logging for creation/deletion
- Import operation logging

You can follow these patterns for other controllers and models in your application.
