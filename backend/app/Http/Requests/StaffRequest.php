<?php

namespace App\Http\Requests;

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
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'staff_name' => [
                'required',
                'unique:staffs,staff_name',
            ],
            'email' => [
                'required',
                'email',
                'unique:staffs,email',
            ],
        ];
    
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['staff_name'][1] = 'unique:staffs,staff_name,' . $this->route('staff');
            $rules['email'][2] = 'unique:staffs,email,' . $this->route('staff');  
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