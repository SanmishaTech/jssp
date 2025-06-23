<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0 0 5px 0;
            font-size: 24px;
            font-weight: bold;
        }
        .header h2 {
            color: #34495e;
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
        }
        .header p {
            margin: 5px 0;
            color: #7f8c8d;
        }
        .date {
            text-align: right;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
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

    <table>
        <thead>
            <tr>
                <th>Student Name</th>
                @foreach($columns as $key => $label)
                    <th>{{ $label }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($summaries as $summary)
                @if($summary->student)
                    <tr>
                        <td>{{ $summary->student->student_name }}</td>
                        @foreach($columns as $key => $label)
                            <td>{{ $summary->$key ? 'Yes' : 'No' }}</td>
                        @endforeach
                    </tr>
                @endif
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This is an auto-generated report.</p>
    </div>
</body>
</html>
