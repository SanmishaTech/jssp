<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ResignationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // You can add authorization logic if needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'resignation_date' => [
                'nullable', // Allow null or empty values
                'date', // Ensure it's a valid date
                function ($attribute, $value, $fail) {
                    // If the value is not null or empty, check if the date is in the future
                    if ($value) {
                        try {
                            $carbonDate = Carbon::parse($value);
                            // Compare the parsed resignation date with today's date
                            if ($carbonDate->gt(Carbon::today())) {
                                $fail('The resignation date cannot be in the future.');
                            }
                        } catch (\Exception $e) {
                            $fail('The resignation date format is invalid.');
                        }
                    }
                }
            ],
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }   
}