<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLedger extends Model
{
    protected $casts = [
        'created_at' => 'date:Y-m-d',
        'updated_at' => 'date:Y-m-d',
        't_date' => 'date:Y-m-d'
    ];
    
    
    protected $fillable = [
        'id', 'product_id', 't_date','received', 'issued', 'module', 'foreign_key','created_at','updated_at'
    ];


    public static function calculateClosingQuantity(string $id){
        
        $product = Product::find($id);
        // foreach($products as $product){
            $receivedSum = StockLedger::where('product_id', $product->id)->sum('received');
            $issuedSum = StockLedger::where('product_id', $product->id)->sum('issued');
            $opening_quantity = $product->opening_qty;
            $closing_quantity = ($opening_quantity + $receivedSum) - $issuedSum;
            $product->closing_qty = $closing_quantity;
            $product->save();
        // } 
    }

    
}