<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetMaster extends Model
{
    protected $table = 'asset_masters';
    protected $fillable = ['institute_id', 'asset_type', 'service_required'];
}
