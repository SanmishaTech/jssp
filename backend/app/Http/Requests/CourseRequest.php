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
            'medium_code' => [
                'required',
                'unique:courses,medium_code',
            ],
            'medium_title' => [
                'required',
                'unique:courses,medium_title',
            ],
            
        ];
    
       
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
        
         $rules['medium_code'] = [
            'required',
            'unique:courses,medium_code,' .$this->route('course'),
        ];
        $rules['medium_title'] = [
            'required',
            'unique:courses,medium_title,'.$this->route('course') ,
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