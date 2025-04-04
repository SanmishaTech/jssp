<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeticashTransaction extends Model
{
    protected $fillable = [
        'peticash_id',
        'amount',
        'description',
        'type',
        'balance_after',
        'created_by'
    ];

    /**
     * Get the peticash that owns the transaction.
     */
    public function peticash(): BelongsTo
    {
        return $this->belongsTo(Peticash::class);
    }

    /**
     * Get the user who created the transaction.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
