<?php

namespace App\Models;

use App\Models\AssetCategory;
use Illuminate\Database\Eloquent\Model;

class AssetMaster extends Model
{
    protected $table = 'asset_masters';
    protected $fillable = ['institute_id', 'asset_category_ids', 'asset_type', 'service_required'];

    protected $casts = [
        'asset_category_ids' => 'json',
        'service_required' => 'boolean',
    ];

    public function assetCategories()
{
    // This is a custom relationship for JSON field
    // We'll need to manually handle this in queries
    // For example: AssetCategory::whereIn('id', json_decode($assetMaster->asset_category_ids, true))->get()
}

}



