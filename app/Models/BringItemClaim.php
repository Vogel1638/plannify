<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo};

class BringItemClaim extends Model
{
    protected $fillable = ['bring_item_id','user_id','quantity','status','claimed_at','completed_at'];

    protected $casts = [
        'quantity'    => 'decimal:2',
        'claimed_at'  => 'datetime',
        'completed_at'=> 'datetime',
    ];

    public function item(): BelongsTo { return $this->belongsTo(BringItem::class, 'bring_item_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
