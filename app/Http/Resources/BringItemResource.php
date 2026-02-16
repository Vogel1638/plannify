<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BringItemResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'is_optional' => $this->is_optional,
            'is_claimed' => $this->is_claimed,
            'claimed_by' => $this->when($this->is_claimed, function () {
                return [
                    'id' => $this->claimedBy->id,
                    'name' => $this->claimedBy->name,
                ];
            }),
            'claimed_at' => $this->when($this->claimed_at, function () {
                return $this->claimed_at->toRfc3339String();
            }),
            'event_id' => $this->event_id,
            'created_at' => $this->created_at?->toRfc3339String(),
            'updated_at' => $this->updated_at?->toRfc3339String(),
        ];
    }
}
