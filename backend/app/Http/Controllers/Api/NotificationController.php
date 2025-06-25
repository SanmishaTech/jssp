<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\BaseController;
 
class NotificationController extends BaseController
{
    public function index()
    {
        $notifications = Auth::user()->notifications()->latest()->get();
        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead()
{
    Auth::user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);

    return response()->json(['message' => 'All notifications marked as read.']);
}
}
