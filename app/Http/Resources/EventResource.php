<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Host immer als Teilnehmer einfügen (falls nicht in participants)
        $participants = $this->whenLoaded('participants', function () {
            $list = $this->participants->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'role' => $participant->pivot->role,
                    'status' => $participant->pivot->status,
                    'responded_at' => $participant->pivot->responded_at 
                        ? Carbon::parse($participant->pivot->responded_at)->toRfc3339String()
                        : null,
                ];
            })->toArray();
            // Host ergänzen, falls nicht enthalten
            if ($this->host && !collect($list)->pluck('id')->contains($this->host->id)) {
                $list[] = [
                    'id' => $this->host->id,
                    'name' => $this->host->name,
                    'role' => 'host',
                    'status' => 'going',
                    'responded_at' => null,
                ];
            }
            return $list;
        });
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'public_slug' => $this->public_slug,
            'private_slug' => $this->private_slug,
            'location' => [
                'name' => $this->location_name,
                'address' => $this->location_address,
                'lat' => $this->location_lat ? (float) $this->location_lat : null,
                'lng' => $this->location_lng ? (float) $this->location_lng : null,
            ],
            'starts_at' => $this->starts_at?->toRfc3339String(),
            'ends_at' => $this->ends_at?->toRfc3339String(),
            'requires_approval' => $this->requires_approval,
            'participant_limit' => $this->participant_limit,
            'allow_comments' => $this->allow_comments,
            'host' => [
                'id' => $this->host->id,
                'name' => $this->host->name,
            ],
            'participants' => $participants,
            'participant_count' => is_array($participants) ? count($participants) : 0,
            // WICHTIG: bring_items für die Mitbringliste
            'bring_items' => \App\Http\Resources\BringItemResource::collection($this->bringItems()->with('claimedBy')->get()),
            'created_at' => $this->created_at?->toRfc3339String(),
            'updated_at' => $this->updated_at?->toRfc3339String(),
        ];
    }
}
