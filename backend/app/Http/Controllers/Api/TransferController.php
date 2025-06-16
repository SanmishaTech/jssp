<?php

namespace App\Http\Controllers\Api;

use App\Models\Transfer;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Http\Resources\TransferResource;
use App\Http\Controllers\Api\BaseController;

class TransferController extends BaseController
{
    /**
     * Display a listing of transfers (optionally filter by status)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transfer::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // If the logged-in user is not superadmin, show only their institute's transfers
        $user = Auth::user();
        if ($user && $user->roles && $user->roles->first() && $user->roles->first()->name !== 'superadmin') {
            $instituteId = $user->staff->institute_id ?? null;
            if ($instituteId) {
                $query->where(function ($q) use ($instituteId) {
                    $q->where('from_institute_id', $instituteId)->orWhere('to_institute_id', $instituteId);
                });
            }
        }

        $transfers = $query->orderBy('id', 'DESC')->paginate(10);
        return $this->sendResponse([
            'Transfers' => TransferResource::collection($transfers),
            'Pagination' => [
                'current_page' => $transfers->currentPage(),
                'last_page'    => $transfers->lastPage(),
                'per_page'     => $transfers->perPage(),
                'total'        => $transfers->total(),
            ],
        ], 'Transfers retrieved successfully');
    }

    /**
     * Store a newly created transfer request (status: pending)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inventory_id'             => 'required|exists:inventories,id',
            'target_type'              => 'required|in:room,institute',
            'destination_room_id'      => 'required_if:target_type,room|nullable|exists:rooms,id',
            'destination_institute_id' => 'required_if:target_type,institute|nullable|exists:institutes,id',
            'quantity'                 => 'required|integer|min:1',
        ]);

        $inventory = Inventory::findOrFail($validated['inventory_id']);

        // Basic quantity check (optional advanced logic for partial quantities)
        if ($validated['quantity'] > $inventory->quantity) {
            return $this->sendError('Requested quantity exceeds available inventory');
        }

        $transfer = Transfer::create([
            'inventory_id'       => $inventory->id,
            'from_room_id'       => $inventory->room_id,
            'from_institute_id'  => $inventory->institute_id,
            'to_room_id'         => $validated['target_type'] === 'room' ? $validated['destination_room_id'] : null,
            'to_institute_id'    => $validated['target_type'] === 'institute' ? $validated['destination_institute_id'] : null,
            'quantity'           => $validated['quantity'],
            'requested_by'       => Auth::id(),
            'status'             => 'pending',
        ]);

        return $this->sendResponse(new TransferResource($transfer), 'Transfer request created');
    }

    /**
     * Approve a transfer
     */
    public function approve(string $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user || !($user->roles && in_array($user->roles->first()->name, ['admin', 'viceprincipal']))) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $transfer = Transfer::findOrFail($id);
        if ($transfer->status !== 'pending') {
            return $this->sendError('Transfer already processed');
        }

        DB::transaction(function () use ($transfer, $user) {
            // Handle quantity movement
            $inventory = $transfer->inventory;
            $qtyToMove = $transfer->quantity;

            if ($qtyToMove >= $inventory->quantity) {
                // Full quantity move – just change location
                if ($transfer->to_room_id) {
                    $inventory->room_id = $transfer->to_room_id;
                }
                if ($transfer->to_institute_id) {
                    $inventory->institute_id = $transfer->to_institute_id;
                }
                $inventory->save();
            } else {
                // Partial move – reduce qty on original and create a new inventory record at destination
                $inventory->quantity = $inventory->quantity - $qtyToMove;
                $inventory->save();

                $newInventory = $inventory->replicate();
                $newInventory->quantity = $qtyToMove;
                if ($transfer->to_room_id) {
                    $newInventory->room_id = $transfer->to_room_id;
                }
                if ($transfer->to_institute_id) {
                    $newInventory->institute_id = $transfer->to_institute_id;
                }
                $newInventory->save();
            }

            $transfer->status      = 'approved';
            $transfer->approved_by = $user->id;
            $transfer->approved_at = Carbon::now();
            $transfer->save();
        });

        return $this->sendResponse(new TransferResource($transfer->refresh()), 'Transfer approved');
    }

    /**
     * Reject a transfer
     */
    public function reject(string $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user || !($user->roles && in_array($user->roles->first()->name, ['admin', 'viceprincipal']))) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $transfer = Transfer::findOrFail($id);
        if ($transfer->status !== 'pending') {
            return $this->sendError('Transfer already processed');
        }

        $transfer->status      = 'rejected';
        $transfer->approved_by = $user->id;
        $transfer->approved_at = Carbon::now();
        $transfer->save();

        return $this->sendResponse(new TransferResource($transfer), 'Transfer rejected');
    }
}
