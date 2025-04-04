<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Peticash extends Model
{
    protected $fillable = [
        'institute_id',
        'total_amount',
        'note',
        'note_amount',
        'total_spend'
    ];

    /**
     * Get all transactions for this peticash.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(PeticashTransaction::class);
    }
}
