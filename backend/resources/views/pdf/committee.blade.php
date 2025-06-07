<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Committee Details' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif; /* Using DejaVu Sans for better character support */
            margin: 20px;
            font-size: 12px;
        }
        .header-main {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        .header-main h1 {
            margin: 0; font-size: 18px; font-weight: bold;
        }
        .header-main h2 {
            margin: 5px 0; font-size: 16px;
        }
        .header-main p {
            margin: 2px 0; font-size: 12px;
        }
        .info-section {
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #eee;
            background-color: #f9f9f9;
        }
        .info-section p {
            margin: 5px 0;
        }
        .info-section strong {
            display: inline-block;
            width: 150px; /* Adjust as needed */
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
        }
        table th, table td {
            border: 1px solid #666;
            padding: 6px;
            text-align: left;
        }
        table th {
            background-color: #e9e9e9;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #777;
        }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="header-main">
        <h1>Jevandeep Shaishanik Sanstha Poi's</h1>
        <h2>{{ $title ?? 'Committee Report' }}</h2>
        <p>Institute: {{ $instituteName ?? 'N/A' }}</p>
        <p class="text-right">Generated on: {{ $date ?? 'N/A' }}</p>
    </div>

    <div class="info-section">
        <h3>Committee Details</h3>
        <p><strong>Committee Name:</strong> {{ $committee->commitee_name ?? 'N/A' }}</p>
        {{-- Add any other specific fields of the committee itself here --}}
        {{-- For example, if committee had a description or formation date: --}}
        {{-- <p><strong>Description:</strong> {{ $committee->description ?? 'N/A' }}</p> --}}
        {{-- <p><strong>Formation Date:</strong> {{ $committee->formation_date ? \Carbon\Carbon::parse($committee->formation_date)->format('d M, Y') : 'N/A' }}</p> --}}
    </div>

    @if($committee->commiteeStaff && $committee->commiteeStaff->count() > 0)
        <h3>Committee Members</h3>
        <table>
            <thead>
                <tr>
                    <th>Sr. No.</th>
                    <th>Staff Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Employee Code</th>
                    <th>Designation in Committee</th>
                </tr>
            </thead>
            <tbody>
                @foreach($committee->commiteeStaff as $index => $member)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $member->staff->staff_name ?? ($member->staff->first_name ?? 'N/A') . ' ' . ($member->staff->last_name ?? '') }}</td>
                        <td>{{ $member->staff->email ?? 'N/A' }}</td>
                        <td>{{ $member->staff->mobile ?? 'N/A' }}</td>
                        <td>{{ $member->staff->employee_code ?? 'N/A' }}</td>
                        <td>{{ $member->designation ?? 'N/A' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>No members found for this committee.</p>
    @endif

    <div class="footer">
        <p>This is a computer-generated document.</p>
    </div>

</body>
</html>

