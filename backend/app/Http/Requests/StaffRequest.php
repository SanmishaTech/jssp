<?php

namespace App\Http\Requests;

use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class StaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Log all input for debugging
        Log::info('Request data in StaffRequest:', $this->except(['images']));
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'staff_name' => 'required|string|max:255',
             'date_of_birth' => 'required|date',
            'address' => 'required|string',
            'mobile' => 'required|string',
            'role' => 'required|string|',

            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048', // Max 2MB per image
            'images' => 'array|max:5', // Maximum 5 images allowed
            'education' => 'nullable', // Allow any format initially to debug
        ];

        // If education is a JSON string, we'll handle it in the controller
        // If we receive the actual array, apply validation
        if ($this->has('education') && !is_string($this->education)) {
            $rules['education.*.qualification'] = 'required_with:education|string|max:255';
            $rules['education.*.college_name'] = 'required_with:education|string|max:255';
            $rules['education.*.board_university'] = 'required_with:education|string|max:255';
            $rules['education.*.passing_year'] = 'required_with:education|string';
            $rules['education.*.percentage'] = 'required_with:education|string';
        }

        // Add password requirement and unique email validation for new staff creation
        if ($this->isMethod('POST')) {
            $rules['password'] = 'required|string|min:6';
            $rules['email'] = 'required|email|max:255|unique:users,email';
            $rules['staff_name'] = 'required|string|max:255|unique:staff,staff_name';
        }

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $staff = Staff::find($this->route('staff'));
            // For update, we only require certain fields
            $updateRules = [
                'staff_name' => [
                    'required',
                    'unique:staff,staff_name,' . $this->route('staff'),
                ],
                'email' => [
                    'required',
                    'email',
                    'unique:users,email,' . $staff->user_id
                ],
            ];
            
            // Merge the basic rules with update-specific rules
            $rules = array_merge($rules, $updateRules);
        }
    
        return $rules;
    }
    
    public function messages(): array
    {
        return [
            'images.*.image' => 'Each file must be an image',
            'images.*.mimes' => 'Allowed image formats are: jpeg, png, jpg',
            'images.*.max' => 'Each image must not exceed 2MB',
            'images.max' => 'You cannot upload more than 5 images',
            'education.*.qualification.required_with' => 'The qualification field is required when adding education details',
            'education.*.college_name.required_with' => 'The college name field is required when adding education details',
            'education.*.board_university.required_with' => 'The board/university field is required when adding education details',
            'education.*.passing_year.required_with' => 'The passing year field is required when adding education details',
            'education.*.percentage.required_with' => 'The percentage field is required when adding education details',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        Log::warning('Validation failed in StaffRequest:', $validator->errors()->toArray());
        
        throw new HttpResponseException(
            response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}