<?php

namespace App\Http\Controllers\Api;

use App\Models\Subject;
use App\Models\SubSubject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\SubjectResource;
use App\Http\Controllers\Api\BaseController;

class SubjectController extends BaseController
{
    /**
     * Display a listing of the subjects.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = Subject::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('subject_name', 'like', '%' . $searchTerm . '%')
                      ->orWhere('subject_code', 'like', '%' . $searchTerm . '%');
            });
        }

           // Add date filter
           if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

    
          $subject = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "Subject" => SubjectResource::collection($subject),
                'Pagination' => [
                    'current_page' => $subject->currentPage(),
                    'last_page'    => $subject->lastPage(),
                    'per_page'     => $subject->perPage(),
                    'total'        => $subject->total(),
                ]
            ],
            "Subject retrieved successfully"
        );
    }

    /**
     * Store a newly created subject in storage.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Create a new subject record and assign the institute_id from the logged-in admin
        $subject = new Subject();
        $subject->institute_id = Auth::user()->staff->institute_id;  
        $subject->course_id = $request->input('course_id');
        $subject->semester_id = $request->input('semester_id');
        $subject->subject_code = $request->input('subject_code');
        $subject->subject_name = $request->input('subject_name');
        $subject->save();

        // Check if sub_subjects exist in the request
        if ($request->has('sub_subjects') && is_array($request->input('sub_subjects'))) {
            // Prepare the sub-subject details
            $subSubjects = [];
            foreach ($request->input('sub_subjects') as $subSubjectItem) {
                if (isset($subSubjectItem['sub_subject_name']) && !empty($subSubjectItem['sub_subject_name'])) {
                    $subSubjects[] = new SubSubject([
                        'subject_id' => $subject->id,
                        'sub_subject_name' => $subSubjectItem['sub_subject_name'],
                    ]);
                }
            }
            
            // Save the one-to-many relationship if we have sub subjects
            if (!empty($subSubjects)) {
                $subject->subSubjects()->saveMany($subSubjects);
            }
            
            // Reload the relationship for the response
            $subject->load('subSubjects');
        }
        
        return $this->sendResponse(["Subject" => new SubjectResource($subject)], "Subject stored successfully");
    }

    /**
     * Display the specified subject.
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $subject = Subject::find($id);

        if(!$subject){
            return $this->sendError("Subject not found", ['error'=>'Subject not found']);
        }

        return $this->sendResponse(["Subject" => new SubjectResource($subject) ], "Subject retrieved successfully");
    }

    /**
     * Update the specified subject in storage.
     *
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $subject = Subject::find($id);

        if(!$subject){
            return $this->sendError("Subject not found", ['error'=>'Subject not found']);
        }
                       
        $subject->institute_id = Auth::user()->staff->institute_id;
        $subject->course_id = $request->input('course_id');
        $subject->semester_id = $request->input('semester_id');
        $subject->subject_code = $request->input('subject_code');
        $subject->subject_name = $request->input('subject_name');
        $subject->save();
       
        // Handle sub-subjects if they exist in the request
        if ($request->has('sub_subjects') && is_array($request->input('sub_subjects'))) {
            // Delete existing sub-subjects for this subject
            SubSubject::where('subject_id', $subject->id)->delete();
            
            // Prepare and add new sub-subjects
            $subSubjects = [];
            foreach ($request->input('sub_subjects') as $subSubjectItem) {
                if (isset($subSubjectItem['sub_subject_name']) && !empty($subSubjectItem['sub_subject_name'])) {
                    $subSubjects[] = new SubSubject([
                        'subject_id' => $subject->id,
                        'sub_subject_name' => $subSubjectItem['sub_subject_name'],
                    ]);
                }
            }
            
            // Save the new sub-subjects if we have any
            if (!empty($subSubjects)) {
                $subject->subSubjects()->saveMany($subSubjects);
            }
            
            // Reload the relationship for the response
            $subject->load('subSubjects');
        }
        
        return $this->sendResponse(["Subject" => new SubjectResource($subject)], "Subject updated successfully");
    }

    /**
     * Remove the specified subject from storage.
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $subject = Subject::find($id);
        if(!$subject){
            return $this->sendError("Subject not found", ['error'=> 'Subject not found']);
        }
        $subject->delete();
        return $this->sendResponse([], "Subject deleted successfully");
    }

    /**
     * Get all subjects for the current institute.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function allSubject()
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $subject = Subject::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Subject" => SubjectResource::collection($subject)],
            "Subject retrieved successfully"
        );
    }
}