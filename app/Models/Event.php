<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany, HasMany};

class Event extends Model
{
    use HasFactory;
    protected $fillable = [
        'host_id','title','description','visibility','public_slug','private_slug',
        'location_name','location_address','location_lat','location_lng',
        'starts_at','ends_at','requires_approval','participant_limit','allow_comments','is_archived'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'requires_approval' => 'boolean',
        'allow_comments' => 'boolean',
        'is_archived' => 'boolean',
        'location_lat' => 'decimal:7',
        'location_lng' => 'decimal:7',
    ];

    public function host(): BelongsTo { return $this->belongsTo(User::class, 'host_id'); }

    public function participants(): BelongsToMany {
        return $this->belongsToMany(User::class)
            ->withPivot(['role','status','invited_by','responded_at'])
            ->withTimestamps();
    }

    public function going(): BelongsToMany {
        return $this->participants()->wherePivot('status', 'going');
    }

    public function bringItems(): HasMany { return $this->hasMany(BringItem::class); }
    public function comments(): HasMany { return $this->hasMany(Comment::class); }
    public function invitations(): HasMany { return $this->hasMany(Invitation::class); }
}
