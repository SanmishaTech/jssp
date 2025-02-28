<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\Institute;

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
                'unique:users,email'
            ],
            'name' => ['required'],
            'password' => $this->isMethod('POST') ? ['required'] : ['nullable'],
        ];
    
       
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $institute = Institute::find($this->route('institute'));
            $rules = [
                'institute_name' => [
                    'required',
                    'unique:institutes,institute_name,' . $this->route('institute'),
                ],
                'email' => [
                    'required',
                    'email',
                    'unique:users,email,' . $institute->user_id
                ],
                'name' => ['required'],
                'password' => ['nullable'],
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