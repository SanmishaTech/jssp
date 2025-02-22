<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institute extends Model
{
    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id', 'user_id');
    }

    public function user()
{
    return $this->belongsTo(User::class);
}


    protected static function booted()
    {
        static::deleting(function ($institute) {
            // Delete the associated profile, if it exists.
            if ($institute->profile) {
                $institute->profile()->delete();
            }
    
            // Delete the associated user, if it exists.
            if ($institute->user) {
                $institute->user()->delete();
            }
        });
    }
    
    
}