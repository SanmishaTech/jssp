<?php

namespace App\Models;

use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'institute_id',
        'asset_master_id',
        'quantity',
        'room_id',
        'purchase_date',
        'purchase_price',
        'status',
        'scraped_amount',
        'scraped_quantity',
        'remarks',
    ];

  public function institute(){
    return $this->belongsTo(Institute::class);
  }

  public function room(){
    return $this->belongsTo(Room::class);
  }

  public function transfers(){
    return $this->hasMany(Transfer::class);
  }

  public function assetMaster(){
    return $this->belongsTo(AssetMaster::class);
  }
}