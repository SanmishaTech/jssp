<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentSummaryResource;
use App\Models\StudentSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Mpdf\Mpdf;

class StudentSummaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // If a student_id is provided, return (or create) the summary for that student only.
        if ($request->filled('student_id')) {
            $request->validate([
                'student_id' => 'exists:students,id',
            ]);

            $summary = StudentSummary::firstOrCreate([
                'student_id' => $request->student_id,
            ]);

            return new StudentSummaryResource($summary->load('student'));
        }

        // Otherwise return a collection of summaries for ALL students.
        // Ensure summaries exist for each student so that the UI can rely on default records.
        $existingStudentIds = StudentSummary::pluck('student_id')->toArray();
        $allStudentIds = \App\Models\Student::pluck('id')->toArray();
        $missingIds = array_diff($allStudentIds, $existingStudentIds);
        // Create default summaries for students that don't have one yet.
        foreach ($missingIds as $id) {
            StudentSummary::create(['student_id' => $id]);
        }

        $summaries = StudentSummary::all();
        return StudentSummaryResource::collection($summaries->load('student'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'student_id' => 'required|exists:students,id',
            'challan_paid' => 'required|boolean',
            'exam_form_filled' => 'required|boolean',
            'college_fees_paid' => 'required|boolean',
            'exam_fees_paid' => 'required|boolean',
            'hallticket' => 'required|boolean',
        ]);

        $summary = StudentSummary::updateOrCreate(
            ['student_id' => $validatedData['student_id']],
            $validatedData
        );

        return new StudentSummaryResource($summary);
    }

    /**
     * Display the specified resource.
     */
    public function show(StudentSummary $studentSummary)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StudentSummary $studentSummary)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StudentSummary $studentSummary)
    {
        //
    }

    public function pdf(Request $request)
    {
        $query = StudentSummary::with('student');

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->whereHas('student', function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%');
            });
        }

        if ($request->filled('filter_column') && $request->filled('filter_value')) {
            $column = $request->input('filter_column');
            $value = $request->input('filter_value') === 'true' ? 1 : 0;

            $allowedColumns = [
                'challan_paid',
                'exam_form_filled',
                'college_fees_paid',
                'exam_fees_paid',
                'hallticket',
            ];

            if (in_array($column, $allowedColumns)) {
                $query->where($column, $value);
            }
        }

        $summaries = $query->get();

        // Determine selected columns for the PDF header
        $columnConfig = [
            'challan_paid' => 'Challan Paid',
            'exam_form_filled' => 'Exam Form Filled',
            'college_fees_paid' => 'College Fees Paid',
            'exam_fees_paid' => 'Exam Fees Paid',
            'hallticket' => 'Hall Ticket',
        ];

        $columnKeys = $request->filled('columns')
            ? array_filter(explode(',', $request->input('columns')))
            : array_keys($columnConfig);
        
        $selectedColumns = [];
        foreach ($columnKeys as $key) {
            if (array_key_exists($key, $columnConfig)) {
                $selectedColumns[$key] = $columnConfig[$key];
            }
        }

        $data = [
            'summaries' => $summaries,
            'title' => 'Student Summary Report',
            'date' => now()->format('d-m-Y'),
            'institute' => Auth::user()->staff->institute->institute_name ?? 'N/A',
            'columns' => $selectedColumns
        ];

        $pdf = new Mpdf(['tempDir' => storage_path('app/mpdf')]);
        $html = View::make('pdf.student-summary', $data)->render();
        $pdf->WriteHTML($html);

        $filename = 'student-summary-report.pdf';
        return $pdf->Output($filename, 'I');
    }
}
