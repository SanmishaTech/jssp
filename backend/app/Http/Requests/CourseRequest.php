<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CourseRequest extends FormRequest
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
            'faculty_code' => [
                'required',
                'unique:courses,faculty_code',
            ],
            'faculty_title' => [
                'required',
                'unique:courses,faculty_title',
            ],
            
        ];
    
       
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
        
         $rules['faculty_code'] = [
            'required',
            'unique:courses,faculty_code,' .$this->route('course'),
        ];
        $rules['faculty_title'] = [
            'required',
            'unique:courses,faculty_title,'.$this->route('course') ,
        ];
    }
    
        return $rules;
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