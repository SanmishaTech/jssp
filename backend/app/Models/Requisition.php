<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AssetMaster;

class Requisition extends Model
{
    protected $fillable = [
        'institute_id',
        'asset_master_id',
        'description'
    ];

    /**
     * Get the asset master associated with the requisition.
     */
    public function assetMaster()
    {
        return $this->belongsTo(AssetMaster::class, 'asset_master_id');
    }
}
