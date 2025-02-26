<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RoomRequest extends FormRequest
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
            'room_name' => [
                'required',
                'unique:rooms,room_name',
            ],
            'room_number' => [
                'required',
                'unique:rooms,room_number',
            ],
           
        ];
    
       
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
         
            $rules['room_name'] = [
                'required',
                'unique:rooms,room_name,' .$this->route('room'),
            ];
            $rules['room_number'] = [
                'required',
                'unique:rooms,room_number,'.$this->route('room') ,
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