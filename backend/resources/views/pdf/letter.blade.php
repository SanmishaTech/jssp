<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Letter</title>
    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        .letterhead {
            width: 100%;
            height: 60mm;
            text-align: center;
            margin: 0;
            padding: 0;
            display: block;
        }

        .letterhead .logo {
            font-size: 22pt;
            font-weight: bold;
            color: #000000;
            margin: 0;
            letter-spacing: 1px;
        }

        .letterhead .institute-name {
            font-size: 14pt;
            color: #555555;
            margin: 5px 0 0;
            font-style: italic;
            text-decoration: underline;
        }

        .letterhead-image {
            width: 100%;
            height: 60mm;
            object-fit: cover;
            margin: 0;
            padding: 0;
            display: block;
        }

        .content-container {
            padding: 15mm 25mm;
            padding-top: 10mm; /* Space after letterhead */
        }
        
        .metadata {
            margin-bottom: 15mm;
        }

        .metadata table {
            width: 100%;
            border-collapse: collapse;
        }

        .metadata .label {
            font-weight: bold;
            width: 80px;
        }

        .metadata .date {
            text-align: right;
        }

        .letter-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin-top: 10mm;
            margin-bottom: 10mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .letter-body {
            text-align: justify;
            margin-bottom: 15mm;
        }

        .footer {
            position: fixed;
            bottom: 10mm;
            left: 25mm;
            right: 25mm;
            text-align: center;
            font-size: 10pt;
            color: #888888;
            border-top: 1px solid #cccccc;
            padding-top: 5px;
        }

        /* Ensure content doesn't overlap with footer */
        .content-container {
            margin-bottom: 20mm;
        }
    </style>
</head>
<body>
    <!-- Letterhead Section -->
    <div class="letterhead">
        @if(isset($letterheadImage) && file_exists($letterheadImage))
            @php
                $imageData = base64_encode(file_get_contents($letterheadImage));
                $imageMimeType = mime_content_type($letterheadImage);
                $base64Image = 'data:' . $imageMimeType . ';base64,' . $imageData;
            @endphp
            <img src="{{ $base64Image }}" alt="Letterhead" class="letterhead-image">
        @else
            <div style="padding-top: 20mm;">
                <p class="logo">Jevandeep Shaishnik Santha POI's</p>
                <p class="institute-name">{{ $staff->institute?->institute_name ?? 'N/A' }}</p>
            </div>
        @endif
    </div>

    <!-- Content Section -->
    <div class="content-container">
        <div class="metadata">
            <table>
                <tr>
                    <td><span class="label">Ref No:</span> {{ $letter->letter_number ?? 'N/A' }}</td>
                    <td class="date"><span class="label">Date:</span> {{ date('F j, Y') }}</td>
                </tr>
            </table>
        </div>

        <div class="letter-title">
            <span>{{ $letter->letter_title }}</span>
        </div>

        <div class="letter-body">
            {!! $letter->letter_description !!}
        </div>
    </div>

    <!-- Footer Section -->
    <div class="footer">
        Jevandeep Shaishnik Santha POI's | {{ $staff->institute?->institute_name ?? 'N/A' }}
    </div>
</body>
</html>