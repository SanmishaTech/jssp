<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Letter</title>
    <style>
        @page {
            margin: 25mm;
        }

        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #333333;
        }

        .letterhead {
            text-align: center;
            margin-bottom: 10mm;
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
            bottom: -20mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10pt;
            color: #888888;
            border-top: 1px solid #cccccc;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="footer">
        Jevandeep Shaishnik Santha POI's | {{ $staff->institute?->institute_name ?? 'N/A' }}
    </div>

    <div class="letterhead">
        <p class="logo">Jevandeep Shaishnik Santha POI's</p>
        <p class="institute-name">{{ $staff->institute?->institute_name ?? 'N/A' }}</p>
    </div>

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


</body>
</html>
