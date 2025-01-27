<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
   public function room()
   {
    return $this-> belongsTo(Room::class, "room_id");
   }

   public function institute()
   {
    return $this->belongsTo(Institute::class, "institute_id");
   }
}