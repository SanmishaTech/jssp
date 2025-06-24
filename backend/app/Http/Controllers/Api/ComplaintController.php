<?php

namespace App\Http\Controllers\Api;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ComplaintResource;
use App\Http\Controllers\Api\BaseController;
use App\Models\Notification;

class ComplaintController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Initialize the query builder
        $query = Complaint::query();

        // Get the authenticated user
        $user = Auth::user();

        if (!$user->hasRole('superadmin')) {
            $query->where('institute_id', $user->staff->institute_id);
        }

        // $query->when(!$user->hasRole('superadmin'), function($query) use ($user) {
        //     return $query->where('institute_id', $user->staff->institute_id);
        // });
        
              
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('institute_id', 'like', '%' . $searchTerm . '%')
                    ->orWhere('complainant_name', 'like', '%' . $searchTerm . '%');
             });
        }
    
        // Paginate the results.
        $complaint = $query->paginate(7);
    
        // Return the paginated response with complaint resources.
        return $this->sendResponse(
            [
                "Complaint" => ComplaintResource::collection($complaint),
                'Pagination' => [
                    'current_page' => $complaint->currentPage(),
                    'last_page'    => $complaint->lastPage(),
                    'per_page'     => $complaint->perPage(),
                    'total'        => $complaint->total(),
                ]
            ],
            "Complaint retrieved successfully"
        );
    }
    


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
         $complaint = new Complaint();
         $complaint->institute_id = Auth::user()->staff->institute_id;  
         $complaint->complaint_date = $request->input('complaint_date');
         $complaint->complainant_name = $request->input('complainant_name');
         $complaint->nature_of_complaint = $request->input('nature_of_complaint');
         $complaint->description = $request->input('description');
         $complaint->save();

        Notification::sendToRoles(['superadmin', 'viceprincipal'],
            'New Complaint Submitted',
            'A new complaint has been submitted by ' . (Auth::user()->staff->name ?? Auth::user()->name) . ' (' . Auth::user()->roles->pluck('name')->implode(', ') . ').',
            '/complaints', // Note: You may need to adjust this link to match your frontend routes
            Auth::user()
        );
        
        return $this->sendResponse([ "Complaint" => new ComplaintResource( $complaint)], "Complaint stored successfully");
    }


    public function show(string $id): JsonResponse
    {
         $complaint = Complaint::find($id);

        if(! $complaint){
            return $this->sendError("Complaint not found", ['error'=>'Complaint not found']);
        }

  
        return $this->sendResponse([ "Complaint" => new ComplaintResource( $complaint) ], "Complaint retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
         $complaint = Complaint::find($id);

        if(! $complaint){
            return $this->sendError("Complaint not found", ['error'=>'Complaint not found']);
        }
       
                       
         $complaint->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
          $complaint->complaint_date = $request->input('complaint_date');
         $complaint->complainant_name = $request->input('complainant_name');
         $complaint->nature_of_complaint = $request->input('nature_of_complaint');
         $complaint->description = $request->input('description');
            $complaint->save();
       
        return $this->sendResponse([ "Complaint" => new ComplaintResource( $complaint)], "Complaint updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
         $complaint = Complaint::find($id);
        if(! $complaint){
            return $this->sendError("Complaint not found", ['error'=> 'Complaint not found']);
        }
          $complaint->delete();
         return $this->sendResponse([], "Complaint deleted successfully");
    }

    public function allComplaints(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $complaint = Complaint::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Complaint" => ComplaintResource::collection($complaint)],
            "Complaint retrieved successfully"
        );
    }
}