<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Profile - {{ $staff->staff_name ?? 'N/A' }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px; /* Base font size for PDF */
        }
        .container {
            width: 90%; /* More standard width */
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.05); /* Subtle shadow */
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff; /* Professional blue */
            margin-bottom: 30px; /* Increased margin */
        }
        .header h1 { /* Institution Name */
            margin: 0 0 5px 0;
            font-size: 24px;
            color: #007bff;
        }
        .header p { /* Document Title */
            margin: 0;
            font-size: 16px;
            color: #555;
            font-weight: bold;
        }
        .profile-section {
            margin-bottom: 25px;
        }
        .profile-section h2 {
            font-size: 18px;
            color: #333; /* Darker heading color */
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            margin-top: 0; /* Remove default top margin */
            margin-bottom: 15px;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr; /* Two columns */
            gap: 10px 20px; /* Row gap, Column gap */
        }
        .detail-item {
            padding: 5px 0; /* Add some padding for better spacing */
        }
        .detail-item strong {
            display: inline-block;
            min-width: 120px; /* Ensure labels align nicely */
            color: #555;
            font-weight: bold; /* Make labels bold */
        }
        .detail-item span {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 40px; /* More space before footer */
            padding-top: 20px; /* More padding in footer */
            border-top: 1px solid #eee;
            font-size: 10px;
            color: #777;
        }
        .footer p {
            margin: 5px 0;
        }

        /* Basic table styling if needed for other sections */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f7f7f7;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $staff->institute->institute_name ?? 'N/A' }}</h1>
            <p>{{ $staff->staff_name ?? 'N/A' }}</p>
        </div>

        <div class="profile-section">
            <h2>Personal Information</h2>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Full Name:</strong>
                    <span>{{ $staff->staff_name ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Employee Code:</strong>
                    <span>{{ $staff->employee_code ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Email Address:</strong>
                    <span>{{ $staff->email ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Mobile Number:</strong>
                    <span>{{ $staff->mobile ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Date of Birth:</strong>
                    <span>{{ isset($staff->dob) && $staff->dob ? \Carbon\Carbon::parse($staff->dob)->format('F j, Y') : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Gender:</strong>
                    <span>{{ isset($staff->gender) ? ucfirst($staff->gender) : 'N/A' }}</span>
                </div>
                 <div class="detail-item" style="grid-column: span 2;"> <!-- Full width for address -->
                    <strong>Address:</strong>
                    <span>{{ $staff->address ?? ($staff->permanent_address ?? 'N/A') }}</span>
                </div>
            </div>
        </div>

        <div class="profile-section">
            <h2>Employment Details</h2>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Department:</strong>
                    <span>{{ $staff->department->name ?? ($staff->department_name ?? 'N/A') }}</span>
                </div>
                <div class="detail-item">
                    <strong>Designation:</strong>
                    <span>{{ $staff->designation->name ?? ($staff->designation_name ?? 'N/A') }}</span>
                </div>
                <div class="detail-item">
                    <strong>Date of Joining:</strong>
                    <span>{{ isset($staff->date_of_joining) && $staff->date_of_joining ? \Carbon\Carbon::parse($staff->date_of_joining)->format('F j, Y') : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Employment Type:</strong>
                    <span>{{ isset($staff->employment_type) ? ucfirst($staff->employment_type) : 'N/A' }}</span>
                </div>
                <!-- Add more employment details as needed -->
            </div>
        </div>

        <!-- Example: Add a section for qualifications if available -->
        {{--
        @if(isset($staff->qualifications) && $staff->qualifications->count() > 0)
        <div class="profile-section">
            <h2>Qualifications</h2>
            <table>
                <thead>
                    <tr>
                        <th>Degree</th>
                        <th>Institution</th>
                        <th>Year of Passing</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($staff->qualifications as $qualification)
                    <tr>
                        <td>{{ $qualification->degree ?? 'N/A' }}</td>
                        <td>{{ $qualification->institution ?? 'N/A' }}</td>
                        <td>{{ $qualification->year_of_passing ?? 'N/A' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif
        --}}

        <div class="footer">
            <p>Generated on: {{ \Carbon\Carbon::now()->format('F j, Y, g:i a') }}</p>
            <p>&copy; {{ \Carbon\Carbon::now()->format('Y') }} {{ $staff->institute->institute_name ?? 'Your Institution Name' }}. All rights reserved.</p>
        </div>
    </div>
</body>
 </html>