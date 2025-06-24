<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'from_id',
        'to_id',
        'type',
        'data',
        'link',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function from()
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    public function to()
    {
        return $this->belongsTo(User::class, 'to_id');
    }

    public function markAsRead()
    {
        if (is_null($this->read_at)) {
            $this->forceFill(['read_at' => $this->freshTimestamp()])->save();
        }
    }

    public static function sendToRoles(array $roles, string $title, string $description, string $link, User $from = null)
    {
        Log::info('sendToRoles called.', [
            'title' => $title,
            'from_user' => $from ? $from->id : 'system',
            'roles' => $roles,
        ]);

        $query = User::whereHas('roles', function ($query) use ($roles) {
            $query->whereIn('name', $roles);
        });

        if ($from) {
            $query->where('id', '!=', $from->id); // Exclude sender
        }

        $recipients = $query->get();

        Log::info('Found ' . $recipients->count() . ' users to notify.');

        foreach ($recipients as $user) {
            Log::info('Creating notification for user: ' . $user->id);
            self::create([
                'from_id' => $from ? $from->id : null,
                'to_id' => $user->id,
                'type' => 'info',
                'data' => [
                    'title' => $title,
                    'description' => $description,
                ],
                'link' => $link,
            ]);
        }
        Log::info('Finished sending notifications.');
    }

    public static function sendToAdmins(string $title, string $description, string $link, User $from = null)
    {
        // Legacy helper targeting superadmin, admin & viceprincipal across all institutes
        self::sendToRoles(['superadmin', 'admin', 'viceprincipal'], $title, $description, $link, $from);
    }

    /**
     * Send a notification to users belonging to the given roles **within** a specific institute.
     */
    public static function sendToInstituteRoles(int $instituteId, array $roles, string $title, string $description, string $link, User $from = null): void
    {
        Log::info('sendToInstituteRoles called.', [
            'title' => $title,
            'from_user' => $from ? $from->id : 'system',
            'roles' => $roles,
            'institute_id' => $instituteId,
        ]);

        $query = User::whereHas('roles', function ($query) use ($roles) {
            $query->whereIn('name', $roles);
        })->whereHas('staff', function ($q) use ($instituteId) {
            $q->where('institute_id', $instituteId);
        });

        if ($from) {
            $query->where('id', '!=', $from->id);
        }

        $recipients = $query->get();

        Log::info('Found ' . $recipients->count() . ' users to notify within institute.');

        foreach ($recipients as $user) {
            self::create([
                'from_id' => $from ? $from->id : null,
                'to_id' => $user->id,
                'type' => 'info',
                'data' => [
                    'title' => $title,
                    'description' => $description,
                ],
                'link' => $link,
            ]);
        }
    }

    /**
     * Send a notification to a single user.
     */
    public static function sendToUser(User $toUser, string $title, string $description, string $link, User $from = null): void
    {
        // Avoid notifying self
        if ($from && $from->id === $toUser->id) {
            return;
        }

        self::create([
            'from_id' => $from ? $from->id : null,
            'to_id' => $toUser->id,
            'type' => 'info',
            'data' => [
                'title' => $title,
                'description' => $description,
            ],
            'link' => $link,
        ]);
    }
}
