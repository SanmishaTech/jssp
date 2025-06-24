<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Notice;
use App\Http\Resources\NoticeResource;
use App\Models\NoticeRead;
use App\Models\Notification;

class NoticeController extends Controller
{
    /**
     * Display a listing of the notices relevant to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first();
        $staffId = $user->staff->id ?? null;
        $instituteId = $user->staff->institute_id ?? null;

        // Superadmin: fetch notices for institute admins
        if ($role === 'superadmin') {
            $notices = Notice::with(['reads.staff'])->where('institute_id', $instituteId)
                ->orderByDesc('created_at')
                ->paginate(20);
        } else {
            // Admin or other roles: fetch notices addressed to them or sent by them, limited to their institute
            $notices = Notice::with(['reads.staff'])
                ->where(function ($q) use ($instituteId) {
                    $q->where('institute_id', $instituteId)
                      ->orWhere('recipient_institute_id', $instituteId);
                })
                ->where(function ($q) use ($staffId, $role) {
                    $q->where('recipient_staff_id', $staffId)
                      ->orWhere('recipient_role', $role)
                      ->orWhere('sender_staff_id', $staffId);
                })
                ->orderByDesc('created_at')
                ->paginate(20);
        }

        // Mark notices as read automatically for every viewer except superadmin (requires valid staff ID)
        if ($role !== 'superadmin' && $staffId) {
            foreach ($notices as $notice) {
                NoticeRead::firstOrCreate(
                    [
                        'notice_id' => $notice->id,
                        'staff_id' => $staffId,
                    ],
                    [
                        'read_at' => now(),
                    ]
                );
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Notices fetched successfully',
            'data' => NoticeResource::collection($notices)
        ]);
    }

    /**
     * Store a newly created notice.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first();
        if (!in_array($role, ['admin', 'superadmin'])) {
            return response()->json(['status' => false, 'message' => 'Forbidden'], 403);
        }

        $request->validate([
            'recipient_role' => 'nullable|string',
            'recipient_staff_id' => 'nullable|exists:staff,id',
            'recipient_institute_id' => $role === 'superadmin' ? 'required|exists:institutes,id' : 'nullable|exists:institutes,id',
            'message' => 'required|string',
        ]);

        $staff = $user->staff;

        $notice = Notice::create([
            'institute_id' => $role === 'admin' ? $staff->institute_id : null,
            'sender_staff_id' => $staff->id ?? null,
            'sender_role' => $role,
            'recipient_staff_id' => $request->recipient_staff_id,
            'recipient_role' => $request->recipient_role,
            'recipient_institute_id' => $role === 'superadmin' ? $request->recipient_institute_id : null,
            'message' => $request->message,
        ]);

        // Decide notification recipients based on sender role and selected targets
        if ($role === 'superadmin') {
            // Notify admins & viceprincipals of the recipient institute
            Notification::sendToInstituteRoles(
                $request->recipient_institute_id,
                ['admin', 'viceprincipal'],
                'New Notice from Superadmin',
                'A new notice has been sent to your institute.',
                '/notices',
                Auth::user()
            );
        } elseif ($role === 'admin') {
            // Admin: if recipient_role provided, notify users of that role in their institute
            if ($request->recipient_role) {
                Notification::sendToInstituteRoles(
                    $staff->institute_id,
                    [$request->recipient_role],
                    'New Notice from Admin',
                    'You have received a new notice.',
                    '/notices',
                    Auth::user()
                );
            }
            // If specific staff selected
            if ($request->recipient_staff_id) {
                $toUser = \App\Models\Staff::find($request->recipient_staff_id)->user;
                if ($toUser) {
                    Notification::sendToUser(
                        $toUser,
                        'New Notice from Admin',
                        'You have received a new notice.',
                        '/notices',
                        Auth::user()
                    );
                }
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Notice sent successfully',
            'data' => new NoticeResource($notice->load(['reads.staff'])),
        ], 201);
    }

    /**
     * Get read receipts for a notice (admin only)
     */
    public function reads($id): JsonResponse
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first();
        if (!in_array($role, ['admin', 'superadmin'])) {
            return response()->json(['status' => false, 'message' => 'Forbidden'], 403);
        }

        $notice = Notice::with('reads.staff')->findOrFail($id);
        return response()->json([
            'status' => true,
            'message' => 'Read receipts',
            'data' => $notice->reads->map(function ($read) {
                return [
                    'staff_id' => $read->staff_id,
                    'read_at' => $read->read_at,
                    'staff_name' => $read->staff->staff_name ?? $read->staff->user->name ?? null,
                ];
            }),
        ]);
    }
}
