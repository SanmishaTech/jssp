<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'vendor_name' => $this->vendor_name,
            'organization_name' => $this->organization_name,
            'contact_name' => $this->contact_name,
            'contact_number' => $this->contact_number,
            'contact_email' => $this->contact_email,
            'contact_address' => $this->contact_address,
            'contact_city' => $this->contact_city,
            'contact_state' => $this->contact_state,
            'contact_pincode' => $this->contact_pincode,
            'contact_country' => $this->contact_country,
            'website' => $this->website,
            'gst_number' => $this->gst_number,
            'organization_pan_number' => $this->organization_pan_number,
            'bank_name' => $this->bank_name,
            'bank_account_holder_name' => $this->bank_account_holder_name,
            'bank_account_number' => $this->bank_account_number,
            'bank_ifsc_code' => $this->bank_ifsc_code,
            'bank_branch' => $this->bank_branch,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }   
}
