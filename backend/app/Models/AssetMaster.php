<?php

namespace App\Models;

use App\Models\AssetCategory;
use Illuminate\Database\Eloquent\Model;

class AssetMaster extends Model
{
    protected $table = 'asset_masters';
    protected $fillable = ['institute_id', 'asset_category_id', 'asset_type', 'service_required'];

    public function assetCategory()
{
    return $this->belongsTo(AssetCategory::class);
}

}



