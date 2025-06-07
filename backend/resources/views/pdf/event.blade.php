<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Details</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .details { margin: 0 auto; width: 80%; }
    .details p { margin: 4px 0; }
    .event-image { max-width: 100%; height: auto; margin-top: 15px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; } /* Added style for image */
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    table, th, td { border: 1px solid #333; }
    th, td { padding: 8px; text-align: left; }
    .date { text-align: right; font-size: 0.9em; margin-bottom: 15px; color: #555; } /* Style for generated date */
  </style>
</head>
<body>
  <div class="header">
    <h1>Jevandeep Shaishnik Santha POI's</h1>
    <h2>{{ $title }}</h2>
    <p>Institute: {{ $institute }}</p>
  </div>
  <div class="date">
    <p>Generated on: {{ $date }}</p>
  </div>
  <div class="details">
    <p><strong>Event Title:</strong> {{ $event->title ?? 'N/A' }}</p>
    <p><strong>Location:</strong> {{ $event->location ?? 'N/A' }}</p>
    <p><strong>Description:</strong> {{ $event->description ?? 'N/A' }}</p>

    <p><strong>Start Date:</strong> {{ $event->start_date ? \Carbon\Carbon::parse($event->start_date)->format('Y-m-d H:i A') : 'N/A' }}</p>


    {{-- Displaying the images --}}
    @if(isset($event->image_paths) && !empty($event->image_paths))
      <p><strong>Event Images:</strong></p>
      @foreach($event->image_paths as $imgPath)
        <img src="{{ $imgPath }}" alt="Event Image" class="event-image" style="margin-bottom: 10px; width: 300px; height: auto;">
      @endforeach
    @else
      <p><strong>Event Images:</strong> No images available.</p>
    @endif
  </div>
</body>
</html>
