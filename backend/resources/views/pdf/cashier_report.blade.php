<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="Content-Style-Type" content="text/css"/>
    <meta http-equiv="Content-Transfer-Encoding" content="binary"/>
    <title>{{ $title }}</title>
    <style>
        @font-face {
            font-family: 'Arial Unicode MS';
            src: local('Arial Unicode MS');
        }
        body {
            font-family: 'Arial Unicode MS', Arial, sans-serif;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
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
        .summary {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .summary h3 {
            margin-top: 0;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        table tr:nth-child(even) {
            background-color: #f9f9f9;
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
    
    <div class="summary" style="width: 100%; white-space: nowrap; margin: 10px 0;">
        <span style="margin-right: 20px;"><strong>Total Cash Amount:</strong> Rs. {{ number_format($totalCash, 2) }}</span>
        <span style="float: right;"><strong>Total Records:</strong> {{ count($cashiers) }}</span>
    </div>
    
    <h3>Detailed Records</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Total Fees</th>
                <th>Cash</th>
                <th>Cheque</th>
                <th>UPI</th>
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($cashiers as $cashier)
            <tr>
                <td>{{ $cashier->id }}</td>
                <td>Rs. {{ number_format($cashier->total_fees, 2) }}</td>
                <td>Rs. {{ number_format($cashier->cash, 2) }}</td>
                <td>Rs. {{ number_format($cashier->cheque, 2) }}</td>
                <td>Rs. {{ number_format($cashier->upi, 2) }}</td>
                <td>{{ \Carbon\Carbon::parse($cashier->created_at)->format('d-m-Y H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        <p>This is an auto-generated report. Please contact the administrator for any queries.</p>
    </div>
</body>
</html>
