<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at?->toRfc3339String(),
            'related_event' => $this->when($this->relatedEvent, function () {
                return [
                    'id' => $this->relatedEvent->id,
                    'title' => $this->relatedEvent->title,
                    'public_slug' => $this->relatedEvent->public_slug,
                ];
            }),
            'related_user' => $this->when($this->relatedUser, function () {
                return [
                    'id' => $this->relatedUser->id,
                    'name' => $this->relatedUser->name,
                ];
            }),
            'action_url' => $this->action_url,
            'action_text' => $this->action_text,
            'created_at' => $this->created_at->toRfc3339String(),
            'updated_at' => $this->updated_at->toRfc3339String(),
        ];
    }
}
