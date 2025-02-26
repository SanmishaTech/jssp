<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class InstituteRequest extends FormRequest
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
            'institute_name' => [
                'required',
                'unique:institutes,institute_name',
            ],
            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],
        ];
    
        // if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
        //     $rules['institute_name'][1] = 'unique:institutes,institute_name,' . $this->route('institutes');
        //     $rules['email'][2] = 'unique:users,email,' . $this->route('institutes');  
        // }
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['institute_name'] = ['required'];
            $rules['email'] = ['required', 'email'];
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