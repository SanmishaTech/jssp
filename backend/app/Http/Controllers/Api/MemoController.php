<?php

namespace App\Http\Controllers\Api;

use App\Models\Memo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\MemoResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MemoRequest;
use Illuminate\Support\Facades\Validator;

class MemoController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instituteId = $user->staff->institute_id;
    
        // Base query: Memos related to the institute
        $query = Memo::with('staff')->where('institute_id', $instituteId);
    
        // If the user is not admin or viceprincipal, limit to their own memos
        if (!$user->hasRole(['admin', 'viceprincipal'])) {
            $query->where('staff_id', $user->staff->id);
        }
    
        // Apply search filtering if present
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('memo_subject', 'like', '%' . $searchTerm . '%')
                      ->orWhere('memo_description', 'like', '%' . $searchTerm . '%')
                      ->orWhereHas('staff', function ($q) use ($searchTerm) {
                          $q->where('staff_name', 'like', '%' . $searchTerm . '%');
                      });
            });
        }
    
        // Filter by specific staff if provided
        if ($request->query('staff_id')) {
            $query->where('staff_id', $request->query('staff_id'));
        }
    
        // Pagination parameters
        $perPage = $request->query('per_page', 9);
        $memos = $query->paginate($perPage, ['*'], 'page', $request->query('page', 1));
    
        return $this->sendResponse(
            [
                "Memo" => MemoResource::collection($memos),
                'Pagination' => [
                    'current_page' => $memos->currentPage(),
                    'last_page'    => $memos->lastPage(),
                    'per_page'     => $memos->perPage(),
                    'total'        => $memos->total(),
                ]
            ],
            "Memo retrieved successfully"
        );
    }
    


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $memo = new Memo();
        $memo->institute_id = Auth::user()->staff->institute_id; 
         $memo->staff_id = $request->input('staff_id');
         $memo->memo_subject = $request->input('memo_subject');
        $memo->memo_description = $request->input('memo_description');
         $memo->save();

        // === Notification Logic ===
        $user = Auth::user();
        $role = $user->getRoleNames()->first();

        if ($role === 'superadmin') {
            // Notify admins & viceprincipals of the institute the memo was created for
            \App\Models\Notification::sendToInstituteRoles(
                $memo->institute_id,
                ['admin', 'viceprincipal'],
                'New Memo from Superadmin',
                'A new memo has been issued to your institute.',
                '/memo',
                $user
            );
        } elseif (in_array($role, ['admin', 'viceprincipal'])) {
            // If specific staff is targeted
            if ($request->filled('staff_id')) {
                $staffModel = \App\Models\Staff::find($request->input('staff_id'));
                if ($staffModel && $staffModel->user) {
                    \App\Models\Notification::sendToUser(
                        $staffModel->user,
                        'New Memo',
                        'You have received a new memo.',
                        '/memo',
                        $user
                    );
                }
            }
            // If admin/viceprincipal creates a memo without specifying staff, assume it is for a role-wide announcement (e.g., teaching staff)
            if ($request->filled('recipient_role')) {
                \App\Models\Notification::sendToInstituteRoles(
                    $memo->institute_id,
                    [$request->input('recipient_role')],
                    'New Memo',
                    'A new memo has been issued for your role.',
                    '/memo',
                    $user
                );
            }
        }
        // === End Notification Logic ===
        
        return $this->sendResponse([ "Memo" => new MemoResource($memo)], "Memo stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $memo = Memo::with('staff')->find($id);

        if(!$memo){
            return $this->sendError("Memo not found", ['error'=>'Memo not found']);
        }

  
        return $this->sendResponse(["Memo" => new MemoResource($memo) ], "Memo retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $memo = Memo::with('staff')->find($id);

        if(!$memo){
            return $this->sendError("Memo not found", ['error'=>'Memo not found']);
        }
       
                       
        $memo->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $memo->staff_id = $request->input('staff_id');
        $memo->memo_subject = $request->input('memo_subject');
        $memo->memo_description = $request->input('memo_description');
     
           $memo->save();
       
        return $this->sendResponse([ "Memo" => new MemoResource($memo)], "Memo updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $memo = Memo::with('staff')->find($id);
        if(!$memo){
            return $this->sendError("Memo not found", ['error'=> 'Memo not found']);
        }
         $memo->delete();
         return $this->sendResponse([], "Memo deleted successfully");
    }

    public function allMemos(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $memo = Memo::with('staff')->where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Memo" => MemoResource::collection($memo)],
            "Memo retrieved successfully"
        );
    }
}
