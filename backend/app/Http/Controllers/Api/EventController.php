<?php

namespace App\Http\Controllers\Api;

use File;
use Response;
use App\Models\Event;
use App\Models\EventImage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\EventResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\BaseController;

class EventController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Event::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('venue', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $event = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Event" => EventResource::collection($event),
                'Pagination' => [
                    'current_page' => $event->currentPage(),
                    'last_page'    => $event->lastPage(),
                    'per_page'     => $event->perPage(),
                    'total'        => $event->total(),
                ]
            ],
            "Event retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Validate the request
        $request->validate([
            'venue' => 'required|string|max:255',
            'date' => 'required|string|max:255',
            'time' => 'required|string|max:255',
            'synopsis' => 'nullable|string',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // Validate each image
            'images' => 'array|max:10', // Maximum 10 images
        ]);
        
        // Create a new event record and assign the institute_id from the logged-in admin
        $event = new Event();
        $event->institute_id = Auth::user()->staff->institute_id;  
        $event->venue = $request->input('venue');
        $event->date = $request->input('date');
        $event->time = $request->input('time');
        $event->synopsis = $request->input('synopsis');
        $event->save();
        
        // Handle image uploads if present
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Store the image
                $path = $image->store('events', 'public');

                // Create EventImage record
                EventImage::create([
                    'event_id' => $event->id,
                    'image_path' => $path
                ]);
            }
        }
        
        return $this->sendResponse([ "Event" => new EventResource($event)], "Event stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $event = Event::find($id);

        if(!$event){
            return $this->sendError("Event not found", ['error'=>'Event not found']);
        }

  
        return $this->sendResponse(["Event" => new EventResource($event) ], "Event retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
        // Validate the request
        $request->validate([
            'venue' => 'required|string|max:255',
            'date' => 'required|string|max:255',
            'time' => 'required|string|max:255',
            'synopsis' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate each image
            'images' => 'nullable|array|max:10', // Maximum 10 images
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer|exists:event_images,id'
        ]);
 
        $event = Event::find($id);

        if(!$event){
            return $this->sendError("Event not found", ['error'=>'Event not found']);
        }
                       
        $event->institute_id = Auth::user()->staff->institute_id;
        $event->venue = $request->input('venue');
        $event->date = $request->input('date');
        $event->time = $request->input('time');
        $event->synopsis = $request->input('synopsis');
        $event->save();
        
        // Handle deletion of images if requested
        if ($request->has('delete_images')) {
            foreach ($request->input('delete_images') as $imageId) {
                $image = EventImage::find($imageId);
                if ($image && $image->event_id == $event->id) {
                    // Delete the file from storage
                    if (Storage::disk('public')->exists($image->image_path)) {
                        Storage::disk('public')->delete($image->image_path);
                    }
                    // Delete the record
                    $image->delete();
                }
            }
        }
        
        // Handle new image uploads if present
        if ($request->hasFile('images')) {
            // Check if adding these new images exceeds the limit of 10
            $currentImageCount = $event->images()->count();
            $newImagesCount = count($request->file('images'));
            
            if ($currentImageCount + $newImagesCount > 10) {
                return $this->sendError("Too many images", ['error' => 'Maximum 10 images allowed per event. Please delete some existing images first.']);
            }
            
            foreach ($request->file('images') as $image) {
                // Store the image
                $originalName = $image->getClientOriginalName();
                $path = $image->storeAs('public/events', $originalName);
                
                // Create EventImage record
                EventImage::create([
                    'event_id' => $event->id,
                    'image_path' => $originalName
                ]);
            }
        }
       
        return $this->sendResponse([ "Event" => new EventResource($event)], "Event updated successfully");
    }


    public function destroy(string $id): JsonResponse
    {
        $event = Event::find($id);
        if(!$event){
            return $this->sendError("Event not found", ['error'=> 'Event not found']);
        }
         $event->delete();
         return $this->sendResponse([], "Event deleted successfully");
    }

    public function allEvents(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $event = Event::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Event" => EventResource::collection($event)],
            "Event retrieved successfully"
        );
    }

    public function displayDocuments(string $document){

        // Generate the full path to the invoice in the public storage
        $path = storage_path('app/public/events/'.$document);
    
        // Check if the file exists
        if (!file_exists($path)) {
            return $this->sendError("Document not found", ['error'=>['Document not found.']]);
        }
    
        // Get the file content and MIME type
        $fileContent = File::get($path);
        $mimeType = File::mimeType($path);
    
        // Create the response for the file download
        $response = Response::make($fileContent, 200);
        $response->header("Content-Type", $mimeType);
        $response->header('Content-Disposition', 'inline; filename="' . $document . '"'); // Set attachment to force download
     //to download the invoice change 'Content-Deposition to attachment from inline
        return $response;
    

}
}