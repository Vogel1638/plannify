<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\{
    BelongsToMany,
    HasMany
};

class User extends Authenticatable // implements MustVerifyEmail  // optional: E-Mail-Verifizierung aktivieren
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Which fields are fillable
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'phone',
        'date_of_birth',
        'bio',
        'avatar_path',
        'timezone',
        'language',
        'notification_email',
        'notification_push',
        'notification_sms',
        'notification_event_updates',
        'notification_new_participants',
        'notification_comments',
        'notification_bring_items',
        'privacy_show_profile',
        'privacy_show_events',
        'privacy_show_participation',
    ];

    /**
     * Fields that should not be serialized.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Type Casts.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'notification_email' => 'boolean',
        'notification_push' => 'boolean',
        'notification_sms' => 'boolean',
        'notification_event_updates' => 'boolean',
        'notification_new_participants' => 'boolean',
        'notification_comments' => 'boolean',
        'notification_bring_items' => 'boolean',
        'privacy_show_profile' => 'boolean',
        'privacy_show_events' => 'boolean',
        'privacy_show_participation' => 'boolean',
    ];

    /* =========================================================================
     |  Relationships
     |======================================================================== */

    /**
     * Events, The User hosts.
     */
    public function hostedEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'host_id');
    }

    /**
     * Events, The User is participating in.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class)
            ->withPivot(['role', 'status', 'invited_by', 'responded_at'])
            ->withTimestamps();
    }

    /**
     * Convenience-Relation: only Events with status "going".
     */
    public function goingEvents(): BelongsToMany
    {
        return $this->events()->wherePivot('status', 'going');
    }

    /**
     * Claims on Bring-mit-Items.
     */
    public function bringClaims(): HasMany
    {
        return $this->hasMany(BringItemClaim::class);
    }

    /**
     * Bring-Items, the User created for Events.
     */
    public function createdBringItems(): HasMany
    {
        return $this->hasMany(BringItem::class, 'event_id')
            ->whereHas('event', function($query) {
                $query->where('host_id', $this->id);
            });
    }

    /**
     * every Bring-Item, the User claimed.
     */
    public function claimedBringItems(): HasMany
    {
        return $this->hasMany(BringItemClaim::class);
    }

    /**
     * Active Bring-Items. (not claimed)
     */
    public function activeBringItems(): HasMany
    {
        return $this->hasMany(BringItem::class, 'event_id')
            ->whereHas('event', function($query) {
                $query->where('host_id', $this->id);
            })
            ->where('is_claimed', false);
    }

    /**
     * Bring-Items, the User is bringing.
     */
    public function bringingItems(): HasMany
    {
        return $this->hasMany(BringItemClaim::class)
            ->where('status', 'confirmed');
    }

    /**
     * comments in Events.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Invitations, the User sent. (private Events)
     */
    public function invitationsSent(): HasMany
    {
        return $this->hasMany(Invitation::class, 'inviter_id');
    }

    /**
     * Notifications of the User.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * unread Notifications of the User.
     */
    public function unreadNotifications(): HasMany
    {
        return $this->hasMany(Notification::class)->where('is_read', false);
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        if ($this->first_name && $this->last_name) {
            return $this->first_name . ' ' . $this->last_name;
        }
        return $this->name;
    }

    /**
     * Get the user's display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->full_name ?? $this->name;
    }

    /**
     * Check if user has notification preferences set.
     */
    public function hasNotificationPreferences(): bool
    {
        return $this->notification_email || $this->notification_push || $this->notification_sms;
    }

    /**
     * Check if user wants to receive specific notification type.
     */
    public function wantsNotification(string $type): bool
    {
        return match($type) {
            'event_updates' => $this->notification_event_updates,
            'new_participants' => $this->notification_new_participants,
            'comments' => $this->notification_comments,
            'bring_items' => $this->notification_bring_items,
            default => false,
        };
    }

    /**
     * Invitations, the User accepted.
     */
    public function invitationsAccepted(): HasMany
    {
        return $this->hasMany(Invitation::class, 'accepted_by_user_id');
    }

    /* =========================================================================
     |  Scopes
     |======================================================================== */

    /**
     * Events, the User is co-hosting. (optional)
     */
    public function cohostedEvents(): BelongsToMany
    {
        return $this->events()->wherePivot('role', 'cohost');
    }

    /* =========================================================================
     |  Accessors/Helper (optional)
     |======================================================================== */

    /**
     * Example: Avatar URL, if you store a field later.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->attributes['avatar_url'] ?? null;
    }
}
