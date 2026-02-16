<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwnProfile = $request->user() && $request->user()->id === $this->id;
        
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'email' => $isOwnProfile ? $this->email : null,
            'created_at' => $this->created_at?->toRfc3339String(),
            'updated_at' => $this->updated_at?->toRfc3339String(),
        ];

        // Personal Data
        if ($isOwnProfile || $this->privacy_show_profile) {
            $data['personal'] = [
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'full_name' => $this->full_name,
                'phone' => $this->phone,
                'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
                'bio' => $this->bio,
                'avatar_path' => $this->avatar_path,
                'timezone' => $this->timezone,
                'language' => $this->language,
            ];
        }

        // Event Data
        if ($this->privacy_show_events) {
            $data['events'] = [
                'hosted_count' => $this->whenLoaded('hostedEvents', function () {
                    return $this->hostedEvents->count();
                }),
                'participating_count' => $this->whenLoaded('events', function () {
                    return $this->events->where('pivot.status', 'going')->count();
                }),
            ];
        }

        // Participation Data
        if ($this->privacy_show_participation) {
            $data['participation'] = [
                'total_events' => $this->whenLoaded('events', function () {
                    return $this->events->count();
                }),
                'going_events' => $this->whenLoaded('goingEvents', function () {
                    return $this->goingEvents->count();
                }),
            ];
        }

        // Items Data
        if ($this->privacy_show_profile) {
            $data['bring_items'] = [
                'created_count' => 0, // Wird später implementiert
                'claimed_count' => 0, // Wird später implementiert
                'active_count' => 0,  // Wird später implementiert
                'bringing_count' => 0, // Wird später implementiert
            ];
        }

        // Notification Settings
        if ($isOwnProfile) {
            $data['notifications'] = [
                'email' => $this->notification_email,
                'push' => $this->notification_push,
                'sms' => $this->notification_sms,
                'event_updates' => $this->notification_event_updates,
                'new_participants' => $this->notification_new_participants,
                'comments' => $this->notification_comments,
                'bring_items' => $this->notification_bring_items,
            ];

            $data['privacy'] = [
                'show_profile' => $this->privacy_show_profile,
                'show_events' => $this->privacy_show_events,
                'show_participation' => $this->privacy_show_participation,
            ];

            // Unread Notifications
            $data['unread_notifications_count'] = $this->whenLoaded('unreadNotifications', function () {
                return $this->unreadNotifications->count();
            });
        }

        return $data;
    }
}
