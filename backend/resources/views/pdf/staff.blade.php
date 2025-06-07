<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Staff Details</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .details { margin: 0 auto; width: 80%; }
    .details p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    table, th, td { border: 1px solid #333; }
    th, td { padding: 8px; text-align: left; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Staff Details</h1>
  </div>
  <div class="details">
    <p><strong>Name:</strong> {{ $staff->staff_name }}</p>
    <p><strong>Email:</strong> {{ $staff->email }}</p>
    <p><strong>Mobile:</strong> {{ $staff->mobile }}</p>
    <p><strong>Employee Code:</strong> {{ $staff->employee_code }}</p>
    <!-- Add more staff details as needed -->
  </div>
</body>
</html>

