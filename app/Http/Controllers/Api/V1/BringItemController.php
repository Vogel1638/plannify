<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BringItemResource;
use App\Models\BringItem;
use App\Models\Event;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BringItemController extends Controller
{
    /**
     * Bring Items anhand von Event ID anzeigen
     */
    public function index($eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            
            // Zugriff auf das Event prüfen
            $userId = auth()->id();
            $hasAccess = $event->visibility === 'public' || 
                        $event->host_id === $userId || 
                        $event->participants()->where('user_id', $userId)->exists();

            if (!$hasAccess) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie haben keinen Zugriff auf dieses Event.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            $bringItems = $event->bringItems()
                ->with(['claimedBy'])
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'data' => BringItemResource::collection($bringItems),
                'meta' => [
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'total_items' => $bringItems->count(),
                    'claimed_items' => $bringItems->where('is_claimed', true)->count(),
                    'unclaimed_items' => $bringItems->where('is_claimed', false)->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten.',
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Neues Item speichern (nur der Host)
     */
    public function store(Request $request, $eventId): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Sie sind nicht authentifiziert.',
                'request_id' => Str::ulid(),
            ], 401);
        }

        try {
            // Debug-Informationen
            \Log::info('BringItem store attempt', [
                'eventId' => $eventId,
                'userId' => $userId,
                'userExists' => auth()->check()
            ]);
            
            $event = Event::where('id', $eventId)
                ->where('host_id', $userId)
                ->first();

            if (!$event) {
                // Prüfe, ob das Event existiert, aber der User nicht der Host ist
                $eventExists = Event::find($eventId);
                if ($eventExists) {
                    return response()->json([
                        'status' => 403,
                        'error' => 'Forbidden',
                        'message' => 'Sie sind nicht der Host dieses Events.',
                        'request_id' => Str::ulid(),
                    ], 403);
                } else {
                    return response()->json([
                        'status' => 404,
                        'error' => 'Not Found',
                        'message' => 'Event nicht gefunden.',
                        'request_id' => Str::ulid(),
                    ], 404);
                }
            }

            $request->validate([
                'name' => 'required|string|max:160',
                'description' => 'nullable|string|max:500',
                'quantity' => 'required|integer|min:1|max:100',
                'is_optional' => 'boolean',
            ]);

            $bringItem = $event->bringItems()->create([
                'name' => $request->name,
                'description' => $request->description,
                'quantity' => $request->quantity,
                'is_optional' => $request->input('is_optional', false),
                'is_claimed' => false,
                'claimed_by' => null,
                'claimed_at' => null,
            ]);

            // Erstelle Benachrichtigung für alle Teilnehmer
            NotificationService::itemAdded($event, $request->name);

            return response()->json([
                'message' => 'Mitbring-Item erfolgreich hinzugefügt.',
                'data' => new BringItemResource($bringItem)
            ], 201);

        } catch (\Exception $e) {
            // Loggin für Debugging
            \Log::error('BringItem store error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten: ' . $e->getMessage(),
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Item beanspruchen
     */
    public function claim(Request $request, $eventId, $itemId): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Sie sind nicht authentifiziert.',
                'request_id' => Str::ulid(),
            ], 401);
        }

        try {
            DB::beginTransaction();

            $event = Event::findOrFail($eventId);
            
            // Prüfe, ob der User am Event teilnimmt
            $participation = $event->participants()
                ->where('user_id', $userId)
                ->where('status', 'going')
                ->first();
                
            $isHost = $event->host_id === $userId;

            if (!$participation && !$isHost) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie nehmen nicht an diesem Event teil, sind noch nicht bestätigt oder sind nicht der Host.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            $bringItem = $event->bringItems()->findOrFail($itemId);

            if ($bringItem->is_claimed) {
                return response()->json([
                    'status' => 400,
                    'error' => 'Bad Request',
                    'message' => 'Dieses Item wurde bereits beansprucht.',
                    'request_id' => Str::ulid(),
                ], 400);
            }

            // Beanspruche das Item
            $bringItem->update([
                'is_claimed' => true,
                'claimed_by' => $userId,
                'claimed_at' => now(),
            ]);

            // Erstelle Benachrichtigung für den Host
            $claimer = auth()->user();
            NotificationService::itemClaimed($event, $claimer, $bringItem->name);

            DB::commit();

            return response()->json([
                'message' => 'Item erfolgreich beansprucht!',
                'data' => new BringItemResource($bringItem->fresh(['claimedBy']))
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten.',
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Item freigeben (nur der Person, die es beansprucht hat)
     */
    public function unclaim(Request $request, $eventId, $itemId): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Sie sind nicht authentifiziert.',
                'request_id' => Str::ulid(),
            ], 401);
        }

        try {
            DB::beginTransaction();

            $event = Event::findOrFail($eventId);
            $bringItem = $event->bringItems()->findOrFail($itemId);

            if (!$bringItem->is_claimed || $bringItem->claimed_by !== $userId) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie können nur Ihre eigenen beanspruchten Items freigeben.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Gebe das Item frei
            $bringItem->update([
                'is_claimed' => false,
                'claimed_by' => null,
                'claimed_at' => null,
            ]);

            // Erstelle Benachrichtigung für den Host
            $unclaimer = auth()->user();
            NotificationService::itemUnclaimed($event, $unclaimer, $bringItem->name);

            DB::commit();

            return response()->json([
                'message' => 'Item erfolgreich freigegeben.',
                'data' => new BringItemResource($bringItem->fresh())
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten.',
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Item aktualisieren (nur der Host)
     */
    public function update(Request $request, $eventId, $itemId): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Sie sind nicht authentifiziert.',
                'request_id' => Str::ulid(),
            ], 401);
        }

        try {
            $event = Event::where('id', $eventId)
                ->where('host_id', $userId)
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder Sie sind nicht der Host.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            $bringItem = $event->bringItems()->findOrFail($itemId);

            $request->validate([
                'name' => 'sometimes|required|string|max:160',
                'description' => 'sometimes|nullable|string|max:500',
                'quantity' => 'sometimes|required|integer|min:1|max:100',
                'is_optional' => 'sometimes|boolean',
            ]);


            $data = $request->only(['name', 'description', 'quantity', 'is_optional']);
            // Host kann claimed_by und is_claimed setzen
            if ($request->has('claimed_by')) {
                $data['claimed_by'] = $request->input('claimed_by');
                $data['is_claimed'] = true;
                $data['claimed_at'] = now();
            }
            if ($request->has('is_claimed') && !$request->boolean('is_claimed')) {
                // explizit freigeben
                $data['claimed_by'] = null;
                $data['claimed_at'] = null;
            }
            $bringItem->update($data);

            return response()->json([
                'message' => 'Mitbring-Item erfolgreich aktualisiert.',
                'data' => new BringItemResource($bringItem->fresh(['claimedBy']))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten.',
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Item löschen (nur der Host)
     */
    public function destroy($eventId, $itemId): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Sie sind nicht authentifiziert.',
                'request_id' => Str::ulid(),
            ], 401);
        }

        try {
            $event = Event::where('id', $eventId)
                ->where('host_id', $userId)
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder Sie sind nicht der Host.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            $bringItem = $event->bringItems()->findOrFail($itemId);
            $bringItem->delete();

            return response()->json([
                'message' => 'Mitbring-Item erfolgreich gelöscht.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten.',
                'request_id' => Str::ulid(),
            ], 500);
        }
    }
}
