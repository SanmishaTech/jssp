<?php

namespace App\Http\Controllers\Api;

use File;
use Response;
use Mpdf\Mpdf;
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
            'images' => 'nullable|array|max:10', // Maximum 10 images
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate each image
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
                try {
                    // Get original filename
                    $originalName = $image->getClientOriginalName();
                    
                    // Store the image in the events directory
                    $path = $image->storeAs('events', $originalName, 'public');
                    
                    // Store only the filename in the database, not the full path
                    // Create EventImage record
                    EventImage::create([
                        'event_id' => $event->id,
                        'image_path' => $originalName
                    ]);
                } catch (\Exception $e) {
                    // Log the error but continue with other images
                    \Log::error('Error uploading image: ' . $e->getMessage());
                }
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
            'images' => 'nullable|array|max:10', // Maximum 10 images
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate each image
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
                    if (Storage::disk('public')->exists('events/'.$image->image_path)) {
                        Storage::disk('public')->delete('events/'.$image->image_path);
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
                try {
                    // Get original filename
                    $originalName = $image->getClientOriginalName();
                    
                    // Store the image
                    $path = $image->storeAs('events', $originalName, 'public');
                    
                    // Store only the filename in the database, not the full path
                    // Create EventImage record
                    EventImage::create([
                        'event_id' => $event->id,
                        'image_path' => $originalName
                    ]);
                } catch (\Exception $e) {
                    // Log the error but continue with other images
                    \Log::error('Error uploading image: ' . $e->getMessage());
                }
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

        // Generate the full path to the file in the public storage
        // Since we're now storing just the filename in the database, we need to construct the full path
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

      /**
     * Generate PDF of event details.
     */
    public function pdf($id)
    {
        $eventModel = Event::with('images')->findOrFail($id); // Removed 'institute' from eager loading

        $eventDataForView = new \stdClass();

        // Map Event model properties to what the Blade view expects
        // Assuming 'title' is not a direct property, derive from synopsis or use a default
        $eventDataForView->title = $eventModel->title ?? ($eventModel->synopsis ? (strlen($eventModel->synopsis) > 70 ? substr($eventModel->synopsis, 0, 67) . '...' : $eventModel->synopsis) : 'Event Details');
        $eventDataForView->description = $eventModel->synopsis ?? 'N/A';
        
        // Combine date and time for Carbon parsing in Blade, if they exist
        if ($eventModel->date && $eventModel->time) {
            $eventDataForView->start_date = $eventModel->date . ' ' . $eventModel->time;
        } elseif ($eventModel->date) {
            $eventDataForView->start_date = $eventModel->date; // Only date available
        } else {
            $eventDataForView->start_date = null; // No date information
        }
        
        // Assuming 'end_date' might exist on the model, otherwise null
        $eventDataForView->end_date = $eventModel->end_date ?? null;
        $eventDataForView->location = $eventModel->venue ?? 'N/A';
        
        // Check for organizer_name or staff_name (from original Blade template context)
        $eventDataForView->organizer_name = $eventModel->organizer_name ?? ($eventModel->staff_name ?? 'N/A');
        
        // Check for email and mobile (from original Blade template context)
        $eventDataForView->email = $eventModel->email ?? 'N/A';
        $eventDataForView->mobile = $eventModel->mobile ?? 'N/A';
        // $eventDataForView->employee_code = $eventModel->employee_code ?? 'N/A'; // If needed from original Blade

        // Image handling: provide absolute paths for mPDF for all images
        $eventDataForView->image_paths = []; // Initialize an array for image paths
        // $eventDataForView->image_url = null; // This was for a single URL, not used for multiple local paths

        if ($eventModel->images->isNotEmpty()) {
            foreach ($eventModel->images as $image) {
                // $image->image_path is assumed to be the filename (e.g., 'event_pic.jpg')
                // Images are stored in 'storage/app/public/events/'
                $potentialImagePath = storage_path('app/public/events/' . $image->image_path);

                if (File::exists($potentialImagePath)) {
                    $eventDataForView->image_paths[] = $potentialImagePath; // Add valid path to the array
                } else {
                    // Log a warning if an image file is not found on the server
                    \Illuminate\Support\Facades\Log::warning("Event PDF: Image file not found at '{$potentialImagePath}' for event ID {$eventModel->id}. DB image_path: '{$image->image_path}'");
                }
            }
        }

        // Prepare additional data for the view header and date
        $institute = null;
        if ($eventModel->institute_id) {
            $institute = \App\Models\Institute::find($eventModel->institute_id);
        }
        $instituteName = $institute ? $institute->institute_name : 'N/A'; // Corrected attribute to 'institute_name'
        $generationDate = \Carbon\Carbon::now()->format('Y-m-d H:i A');

        // Render the Blade view, passing the prepared $eventDataForView object as 'event'
        // and additional specific variables for the new header/date sections
        $html = view('pdf.event', [
            'event' => $eventDataForView,
            'title' => $eventDataForView->title, // This is the event's specific title for the H2
            'institute' => $instituteName,
            'date' => $generationDate
        ])->render();

        // Configure mPDF. Adding tempDir is good practice.
        $mpdf = new Mpdf(['format' => 'A4', 'tempDir' => storage_path('app/mpdf')]);
        $mpdf->WriteHTML($html);
        // Output the PDF directly to the browser for download
        return $mpdf->Output('event_' . $eventModel->id . '.pdf', 'D'); // Download the PDF
    }
}