<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class CommentResource extends JsonResource
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
            'content' => $this->content,
            'is_edited' => $this->is_edited,
            'edited_at' => $this->edited_at?->toRfc3339String(),
            'is_deleted' => $this->is_deleted,
            'deleted_at' => $this->deleted_at?->toRfc3339String(),
            'parent_id' => $this->parent_id,
            'is_reply' => $this->isReply(),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'event' => [
                'id' => $this->event->id,
                'title' => $this->event->title,
            ],
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
            'replies_count' => $this->whenLoaded('replies', function () {
                return $this->replies->count();
            }),
            'created_at' => $this->created_at?->toRfc3339String(),
            'updated_at' => $this->updated_at?->toRfc3339String(),
        ];
    }
}
