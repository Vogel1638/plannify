<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
        'related_event_id',
        'related_user_id',
        'action_url',
        'action_text'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Notification Types
    const TYPE_PARTICIPANT_JOINED = 'participant_joined';
    const TYPE_HOST_DECISION = 'host_decision';
    const TYPE_EVENT_UPDATED = 'event_updated';
    const TYPE_ITEM_CLAIMED = 'item_claimed';
    const TYPE_ITEM_UNCLAIMED = 'item_unclaimed';
    const TYPE_COMMENT_ADDED = 'comment_added';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function relatedEvent(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'related_event_id');
    }

    public function relatedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }

    // Scope for unread Notifications
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    // Scope for read Notifications
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    // mark as read
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    // mark as unread
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    // check if unread
    public function isUnread(): bool
    {
        return !$this->is_read;
    }
}
