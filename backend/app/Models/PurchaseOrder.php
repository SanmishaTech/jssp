<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Vendor;
use App\Models\AssetMaster;
use App\Models\Staff;

class PurchaseOrder extends Model
{
    protected $table = 'purchase_orders';
    protected $fillable = [
        'institute_id',
        'vendor_id',
        'asset_master_id',
        'asset_category_ids',
        'quantity',
        'price',
        'status',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function assetMaster()
    {
        return $this->belongsTo(AssetMaster::class);
    }
    
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
