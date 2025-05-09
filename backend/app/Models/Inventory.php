<?php

namespace App\Models;

use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
  public function institute(){
    return $this->belongsTo(Institute::class);
  }

  public function room(){
    return $this->belongsTo(Room::class);
  }
}