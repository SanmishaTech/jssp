<?php

namespace App\Http\Requests;

use App\Http\Requests\CommiteeeRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CommiteeeRequest extends FormRequest
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
            'commitee_name' => [
                'required',
                'unique:commitees,commitee_name',
            ],
            // 'designation' => [
            //     'required',
            //     'unique:commitee_staff,designation' ,
            // ],
        ];
    
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['commitee_name'] = [
                'required',
                'unique:commitees,commitee_name,' . $this->route('committee'),
             ];
            //  $rules['designation'] = [
            //     'required',
            //     'unique:commitee_staff,designation,' . $this->route('committee'),
            //  ];
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