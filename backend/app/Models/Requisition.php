<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AssetMaster;
use App\Models\User;

class Requisition extends Model
{
    protected $fillable = [
        'institute_id',
        'asset_master_id',
        'description',
        'requested_by',
        'status',
        'approved_by',
        'approval_date',
        'comments'
    ];

    /**
     * Get the asset master associated with the requisition.
     */
    public function assetMaster()
    {
        return $this->belongsTo(AssetMaster::class, 'asset_master_id');
    }
    
    /**
     * Get the user who requested this requisition.
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
    
    /**
     * Get the user who approved or rejected this requisition.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
