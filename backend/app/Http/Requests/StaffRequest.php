<?php

namespace App\Http\Requests;

use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

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
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'staff_name' => 'required|string|max:255',
            'is_teaching' => 'required|string|max:100',
            'date_of_birth' => 'required|date',
            'address' => 'required|string',
            'mobile' => 'required|string',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048', // Max 2MB per image
            'images' => 'array|max:5', // Maximum 5 images allowed
        ];

        // Add password requirement only for new staff creation
        if ($this->isMethod('POST')) {
            $rules['password'] = 'required|string|min:6';
        }

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $staff = Staff::find($this->route('staff'));
            $rules = [
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
        ];
    }

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