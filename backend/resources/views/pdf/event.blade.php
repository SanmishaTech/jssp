<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Details</title>
  <style>
    body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #fff;
        color: #333;
        line-height: 1.6;
        font-size: 14px;
    }
    .container {
        width: 90%;
        max-width: 800px; /* Adjust as needed for A4 or Letter */
        margin: 30px auto;
        padding: 20px;
        background-color: #fff;
    }
    .header {
        text-align: center;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
        margin-bottom: 25px;
    }
    .header h1 {
        font-size: 24px;
        color: #2c3e50;
        margin-bottom: 5px;
        font-weight: 600;
        margin-top:0;
    }
    .header p {
        font-size: 14px;
        color: #555;
        margin-top: 0;
        margin-bottom: 0;
    }
    .details { /* This class might be less critical if .container handles main layout */
        margin-bottom: 20px;
    }
    .details p { margin: 5px 0; font-size: 14px; color: #444; }
    .details p strong { color: #2c3e50; font-weight: 600; }
    /* .event-image class removed as it's replaced by .image-container img styling */
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    table, th, td { border: 1px solid #333; }
    th, td { padding: 8px; text-align: left; }
    .date { text-align: right; font-size: 12px; margin-bottom: 20px; color: #777; }
    .event-card {
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        padding: 20px;
        margin-bottom: 25px;
        background-color: #fdfdfd;
        /* box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* May not render well in all PDF engines */
    }
    .event-card h3 { /* Assuming there might be an h3 for title, though not in current HTML snippet */
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        color: #333;
        font-weight: 600;
    }
    .event-card p {
        margin-bottom: 8px;
        font-size: 14px;
        color: #444;
    }
    .event-card p strong {
        color: #2c3e50;
        font-weight: 600;
    }
    .description-section {
        margin-top: 10px;
    }
    .description-section p {
        margin-top: 0;
        line-height: 1.7;
    }

    .image-gallery {
        margin-top: 10px;
    }
    .images-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-top: 20px; 
        margin-bottom: 10px;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }
    .image-gallery::after {
        content: "";
        clear: both;
        display: table;
    }
    .image-container {
        float: left;
        width: 48%; /* Aim for two columns */
        margin: 0 1% 10px 1%; /* top/right/bottom/left margins */
        /* vertical-align is not applicable to floats */
        text-align: center; /* Center the image within the container */
    }
    .image-container img {
        max-width: 100%;
        height: auto;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 3px;
        background-color: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
  </style>
</head>
<body>
  <div class="container">
  <div class="header">
    <h1>Jevandeep Shaishnik Santha POI's</h1>
    
    <p>Institute: {{ $institute }}</p>
  </div>
  <div class="date">
    <p>Generated on: {{ $date }}</p>
  </div>
  <div class="details">
    <div class="event-card">
       
      <p><strong>Location:</strong> {{ $event->location ?? 'N/A' }} &nbsp;&nbsp;&nbsp; <strong>Start Date:</strong> {{ $event->start_date ? \Carbon\Carbon::parse($event->start_date)->format('Y-m-d H:i A') : 'N/A' }}</p>
      <div class="description-section">
      <div style="word-wrap: break-word; overflow-wrap: anywhere;">
        <strong>Description:</strong>
        {!! $event->description ?? 'N/A' !!}
      </div>
    </div>
    </div>
   

    {{-- Displaying the images --}}
    @if(isset($event->image_paths) && count($event->image_paths) > 0)
      <h4 class="images-title">Event Images:</h4>
      <div class="image-gallery">
        @foreach($event->image_paths as $index => $imgPath)
          <div class="image-container">
            <img src="{{ $imgPath }}" alt="Event Image">
          </div>
        @endforeach
      </div>
    @else
      <p><strong>Event Images:</strong> No images available.</p>
    @endif
  </div>
  </div>
</body>
</html>
