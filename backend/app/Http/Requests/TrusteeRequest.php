<?php

namespace App\Http\Requests;

use App\Models\Trustee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class TrusteeRequest extends FormRequest
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
            'trustee_name' => [
                'required',
                'unique:trustees,trustee_name',
            ],
            'email' => [
                'required',
                'email',
                'unique:users,email'
            ],
         ];
    
         
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $trustee = Trustee::find($this->route('trustee'));
            $rules = [
                'trustee_name' => [
                    'required',
                    'unique:trustees,trustee_name,' . $this->route('trustee'),
                ],
                'email' => [
                    'required',
                    'email',
                    'unique:users,email,' . $trustee->user_id
                ],
              
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