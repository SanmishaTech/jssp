<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffEducationCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'certificate_path',
        'certificate_title'
    ];

    /**
     * Get the staff that owns the certificate.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
