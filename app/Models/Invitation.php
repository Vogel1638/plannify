<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    protected $fillable = [
        'event_id','inviter_id','email','token','status','accepted_by_user_id',
        'accepted_at','declined_at','expires_at'
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'declined_at' => 'datetime',
        'expires_at'  => 'datetime',
    ];

    public function event(): BelongsTo { return $this->belongsTo(Event::class); }
    public function inviter(): BelongsTo { return $this->belongsTo(User::class, 'inviter_id'); }
    public function acceptor(): BelongsTo { return $this->belongsTo(User::class, 'accepted_by_user_id'); }
}
