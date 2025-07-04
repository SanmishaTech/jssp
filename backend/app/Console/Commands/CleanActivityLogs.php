<?php

namespace App\Console\Commands;

use App\Services\ActivityLogService;
use Illuminate\Console\Command;

class CleanActivityLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activity-log:clean {--days=90 : Number of days to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean old activity logs from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        
        $this->info("Cleaning activity logs older than {$days} days...");
        
        $deletedCount = ActivityLogService::cleanOldActivities($days);
        
        $this->info("Successfully deleted {$deletedCount} old activity log entries.");
        
        return Command::SUCCESS;
    }
}
