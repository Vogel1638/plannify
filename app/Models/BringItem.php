<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo};

class BringItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'event_id',
        'name',
        'description', 
        'quantity',
        'is_optional',
        'is_claimed',
        'claimed_by',
        'claimed_at'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'is_optional' => 'boolean',
        'is_claimed' => 'boolean',
        'claimed_at' => 'datetime',
    ];

    public function event(): BelongsTo 
    { 
        return $this->belongsTo(Event::class); 
    }
    
    public function claimedBy(): BelongsTo 
    { 
        return $this->belongsTo(User::class, 'claimed_by'); 
    }
}
