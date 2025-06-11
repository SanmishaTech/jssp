<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\StaffPaper;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\StaffPaperResource;
use App\Http\Controllers\Api\BaseController;

class StaffPaperController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $staffId = Auth::user()->staff->id;
    
        // Start the query by filtering staff based on the institute_id and paginating the results.
        $paper = StaffPaper::where('staff_id', $staffId)->paginate(9);

        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "StaffPaper" => StaffPaperResource::collection($paper),
                'Pagination' => [
                    'current_page' => $paper->currentPage(),
                    'last_page'    => $paper->lastPage(),
                    'per_page'     => $paper->perPage(),
                    'total'        => $paper->total(),
                ]
            ],
            "StaffPaper retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Validate input including optional certificate file
        $request->validate([
            'journal_title'     => 'nullable|string|max:255',
            'research_topic'      => 'nullable|string|max:255',
            'publication_identifier'  => 'nullable|string|max:255',
            'volume'      => 'nullable|string|max:255',
            'issue'        => 'nullable|string',
            'year_of_publication' => 'nullable|string',
            'peer_reviewed'        => 'nullable|string',
            'coauthor'        => 'nullable|string',
            'certificate'       => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048'
        ]);

        // Create a new paper record
        $paper = new StaffPaper();
        $paper->staff_id        = Auth::user()->staff->id;  
        $paper->journal_title           = $request->input('journal_title');
        $paper->research_topic    = $request->input('research_topic');
        $paper->publication_identifier= $request->input('publication_identifier');
        $paper->volume    = $request->input('volume');
        $paper->issue      = $request->input('issue');
        $paper->year_of_publication      = $request->input('year_of_publication');
        $paper->peer_reviewed      = $request->input('peer_reviewed');
        $paper->coauthor      = $request->input('coauthor');

        // Handle certificate upload (optional)
        if ($request->hasFile('certificate')) {
            $file        = $request->file('certificate');
            $original    = $file->getClientOriginalName();
            $uniqueName  = time().'_'.$original;

            // Ensure dir exists
            \Storage::disk('public')->makeDirectory('staff_papers', 0755, true, true);

            $file->storeAs('staff_papers', $uniqueName, 'public');

            $paper->certificate_path = $uniqueName;
        }

        $paper->save();

        return $this->sendResponse([ "StaffPaper" => new StaffPaperResource($paper)], "StaffPaper stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $paper = StaffPaper::find($id);

        if(!$paper){
            return $this->sendError("StaffPaper not found", ['error'=>'StaffPaper not found']);
        }

  
        return $this->sendResponse(["StaffPaper" => new StaffPaperResource($paper) ], "StaffPaper retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
        $paper = StaffPaper::find($id);

        if(!$paper){
            return $this->sendError("StaffPaper not found", ['error'=>'StaffPaper not found']);
        }

        // Validate
        $request->validate([
            'journal_title'     => 'nullable|string|max:255',
            'research_topic'      => 'nullable|string|max:255',
            'publication_identifier'  => 'nullable|string|max:255',
            'volume'      => 'nullable|string|max:255',
            'issue'        => 'nullable|string',
            'year_of_publication' => 'nullable|string',
            'peer_reviewed'        => 'nullable|string',
            'coauthor'        => 'nullable|string',
            'certificate'       => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'delete_certificate'=> 'nullable|boolean'
        ]);

        $paper->staff_id        = Auth::user()->staff->id;
        $paper->journal_title   = $request->input('journal_title');
        $paper->research_topic    = $request->input('research_topic');
        $paper->publication_identifier= $request->input('publication_identifier');
        $paper->volume    = $request->input('volume');
        $paper->issue      = $request->input('issue');
        $paper->year_of_publication      = $request->input('year_of_publication');
        $paper->peer_reviewed      = $request->input('peer_reviewed');
        $paper->coauthor      = $request->input('coauthor');

        // Handle delete request for existing certificate
        if ($request->boolean('delete_certificate') && $paper->certificate_path) {
            if (\Storage::disk('public')->exists('staff_papers/'.$paper->certificate_path)) {
                \Storage::disk('public')->delete('staff_papers/'.$paper->certificate_path);
            }
            $paper->certificate_path = null;
        }

        // Handle new certificate upload
        if ($request->hasFile('certificate')) {
            // Remove old certificate first
            if ($paper->certificate_path && \Storage::disk('public')->exists('staff_papers/'.$paper->certificate_path)) {
                \Storage::disk('public')->delete('staff_papers/'.$paper->certificate_path);
            }

            $file       = $request->file('certificate');
            $original   = $file->getClientOriginalName();
            $uniqueName = time().'_'.$original;

            \Storage::disk('public')->makeDirectory('staff_papers', 0755, true, true);
            $file->storeAs('staff_papers', $uniqueName, 'public');

            $paper->certificate_path = $uniqueName;
        }

        $paper->save();

        return $this->sendResponse(["StaffPaper" => new StaffPaperResource($paper)], "StaffPaper updated successfully");
    }


    public function destroy(string $id): JsonResponse
    {
        $paper = StaffPaper::find($id);
        if(!$paper){
            return $this->sendError("StaffPaper not found", ['error'=> 'StaffPaper not found']);
        }
         $paper->delete();
         return $this->sendResponse([], "StaffPaper deleted successfully");
    }

    public function allStaffPapers(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $staffId = Auth::user()->staff->id;
    
        // Filter staff based on the institute_id.
        $paper = StaffPaper::where('staff_id', $staffId)->get();
    
        return $this->sendResponse(
            ["StaffPaper" => StaffPaperResource::collection($paper)],
            "StaffPaper retrieved successfully"
        );
    }
}
