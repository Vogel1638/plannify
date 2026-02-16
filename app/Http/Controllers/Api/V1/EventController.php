<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventStoreRequest;
use App\Http\Requests\EventUpdateRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Response;

class EventController extends Controller
{
    /**
     * Event löschen (nur der Host)
     */
    public function destroy($eventId): JsonResponse
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
                ->where('is_archived', false)
                ->first();
            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder Sie sind nicht der Host.',
                    'request_id' => Str::ulid(),
                ], 404);
            }
            $event->delete();
            return response()->json([
                'message' => 'Event wurde erfolgreich gelöscht.'
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
     * Liste an Events anzeigen
     */
    public function index(Request $request): JsonResponse
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
            // Hole alle öffentlichen Events
            $publicEvents = Event::where('visibility', 'public')
                ->with(['host', 'participants'])
                ->orderBy('starts_at', 'asc')
                ->get();

            // Hole alle privaten Events des Users
            $privateEvents = Event::where('visibility', 'private')
                ->where('host_id', $userId)
                ->with(['host', 'participants'])
                ->orderBy('starts_at', 'asc')
                ->get();

            // Kombiniere und sortiere alle Events nach Startzeit
            $allEvents = $publicEvents->concat($privateEvents)
                ->sortBy('starts_at')
                ->values();

            return response()->json([
                'data' => EventResource::collection($allEvents),
                'meta' => [
                    'total' => $allEvents->count(),
                    'public_count' => $publicEvents->count(),
                    'private_count' => $privateEvents->count(),
                    'user_id' => $userId,
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
     * Öffentliche Events anzeigen (kein Login nötig)
     */
    public function publicIndex(): JsonResponse
    {
        try {
            $publicEvents = Event::where('visibility', 'public')
                ->where('is_archived', false)
                ->with('host')
                ->orderBy('starts_at', 'asc')
                ->get();

            return response()->json([
                'data' => EventResource::collection($publicEvents),
                'meta' => [
                    'total' => $publicEvents->count(),
                    'message' => 'Öffentliche Events erfolgreich geladen'
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
     * Bestimmtes Event anzeigen (nur öffentliche Events)
     */
    public function show($publicSlug): JsonResponse
    {
        try {
            $event = Event::where('public_slug', $publicSlug)
                ->where('visibility', 'public')
                ->where('is_archived', false)
                ->with(['host', 'participants'])
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder nicht öffentlich verfügbar.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            return response()->json([
                'data' => new EventResource($event)
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
     * Öffentlichem Event beitreten (Login benötigt)
     */
    public function join(Request $request, $publicSlug): JsonResponse
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
            $event = Event::where('public_slug', $publicSlug)
                ->where('visibility', 'public')
                ->where('is_archived', false)
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder nicht öffentlich verfügbar.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            // Prüfe, ob der User bereits teilnimmt
            $existingParticipation = $event->participants()
                ->where('user_id', $userId)
                ->first();

            if ($existingParticipation) {
                return response()->json([
                    'status' => 400,
                    'error' => 'Bad Request',
                    'message' => 'Sie nehmen bereits an diesem Event teil.',
                    'request_id' => Str::ulid(),
                ], 400);
            }

            // Prüfe Teilnehmerlimit (nur bei öffentlichen Events)
            if ($event->participant_limit && $event->participants()->count() >= $event->participant_limit) {
                return response()->json([
                    'status' => 400,
                    'error' => 'Bad Request',
                    'message' => 'Das Event ist bereits voll.',
                    'request_id' => Str::ulid(),
                ], 400);
            }

            // Füge den User zum Event hinzu
            // Teilnahme immer direkt bestätigen (ohne Genehmigung)
            $event->participants()->syncWithoutDetaching([
                $userId => [
                    'role' => 'guest',
                    'status' => 'going',
                    'invited_by' => null,
                    'responded_at' => now(),
                ]
            ]);

            // Erstelle Benachrichtigung für den Host
            $participant = auth()->user();
            try {
                NotificationService::participantJoined($event, $participant);
            } catch (\Throwable $e) {
                \Log::error('Fehler beim Erstellen der Notification (join): ' . $e->getMessage());
                // Fehler bei Notification nicht an den Client weitergeben
            }

            return response()->json([
                'message' => 'Erfolgreich dem Event beigetreten!',
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'public_slug' => $event->public_slug,
                    'status' => 'going'
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
     * Privates Event via Einladungs-Link beitreten (Login benötigt)
     */
    public function joinPrivate(Request $request, $eventId): JsonResponse
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
                ->where('visibility', 'private')
                ->where('is_archived', false)
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Private Event nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            // Prüfe, ob der User bereits teilnimmt
            $existingParticipation = $event->participants()
                ->where('user_id', $userId)
                ->first();

            if ($existingParticipation) {
                return response()->json([
                    'status' => 400,
                    'error' => 'Bad Request',
                    'message' => 'Sie nehmen bereits an diesem Event teil.',
                    'request_id' => Str::ulid(),
                ], 400);
            }


            // Füge den User zum privaten Event hinzu (direkt bestätigt)
            $event->participants()->attach($userId, [
                'role' => 'guest',
                'status' => 'going',
                'invited_by' => null,
                'responded_at' => now(),
            ]);

            return response()->json([
                'message' => 'Beitrittsanfrage für privates Event gesendet. Warten auf Genehmigung des Hosts.',
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'visibility' => 'private',
                    'status' => 'pending'
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
     * Anfrage von Usern genehmigen oder ablehnen (nur der Host)
     */
    public function approveParticipant(Request $request, $eventId, $userId): JsonResponse
    {
        $hostId = auth()->id();
        
        if (!$hostId) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Sie sind nicht authentifiziert.',
                'request_id' => Str::ulid(),
            ], 401);
        }

        try {
            $event = Event::where('id', $eventId)
                ->where('host_id', $hostId)
                ->where('is_archived', false)
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder Sie sind nicht der Host.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            $request->validate([
                'action' => 'required|in:approve,reject',
            ]);

            $action = $request->input('action');
            $newStatus = $action === 'approve' ? 'going' : 'declined';

            // Aktualisiere den Teilnehmerstatus
            $event->participants()->updateExistingPivot($userId, [
                'status' => $newStatus,
                'responded_at' => now(),
            ]);

            // Erstelle Benachrichtigung für den Teilnehmer
            $participant = User::find($userId);
            NotificationService::hostDecision($event, $participant, $action);

            $actionMessage = $action === 'approve' 
                ? 'Teilnehmer erfolgreich genehmigt.' 
                : 'Teilnehmer abgelehnt.';

            return response()->json([
                'message' => $actionMessage,
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'participant_id' => $userId,
                    'new_status' => $newStatus
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
     * Neues Event speichern
     */
    public function store(EventStoreRequest $request): JsonResponse
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

            $data = $request->validated();
            $data['host_id'] = $userId;

            // Generiere public_slug wenn visibility = public
            if ($data['visibility'] === 'public') {
                $baseSlug = Str::slug($data['title']);
                $slug = $baseSlug;
                // Stelle Eindeutigkeit sicher
                $counter = 1;
                while (Event::where('public_slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . Str::lower(Str::random(6));
                    $counter++;
                    if ($counter > 100) {
                        $slug = $baseSlug . '-' . Str::ulid();
                        break;
                    }
                }
                $data['public_slug'] = $slug;
                $data['private_slug'] = null;
                $data['requires_approval'] = $data['requires_approval'] ?? false;
            } else {
                // Private Events: requires_approval = true, kein participant_limit
                $data['public_slug'] = null;
                $data['private_slug'] = strtolower(Str::random(8));
                $data['requires_approval'] = true;
                $data['participant_limit'] = null;
            }

            $event = Event::create($data);
            // Lade die Host-Beziehung für das Resource
            $event->load('host');

            DB::commit();

            return response()->json([
                'message' => 'Event erfolgreich erstellt.',
                'data' => new EventResource($event)
            ], 201);

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
     *Event aktualisieren (nur der Host)
     */
    public function update(EventUpdateRequest $request, $eventId): JsonResponse
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

            $event = Event::where('id', $eventId)
                ->where('host_id', $userId)
                ->where('is_archived', false)
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden oder Sie sind nicht der Host.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            // Speichere alte Werte für Notifications
            $oldValues = $event->only([
                'title', 'description', 'starts_at', 'ends_at', 
                'location_name', 'location_address'
            ]);

            // Aktualisiere das Event
            $data = $request->validated();
            $event->update($data);

            // Lade die Host-Beziehung für das Resource
            $event->load('host');

            // Erstelle Notifications für Änderungen
            $changes = [];
            foreach ($oldValues as $field => $oldValue) {
                if (isset($data[$field]) && $data[$field] != $oldValue) {
                    $changes[$field] = [
                        'old' => $oldValue,
                        'new' => $data[$field]
                    ];
                }
            }

            // Sende Notifications nur wenn es Änderungen gab
            if (!empty($changes)) {
                NotificationService::eventUpdated($event, $changes);
            }

            DB::commit();

            return response()->json([
                'message' => 'Event erfolgreich aktualisiert.',
                'data' => new EventResource($event),
                'changes' => $changes
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Event update error: ' . $e->getMessage(), [
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
     * Event anhand von ID anzeigen
     */

    // Private Event Details via private_slug
    public function showByPrivateSlug($privateSlug): JsonResponse
    {
        $userId = auth()->id();

        try {
            $event = Event::where('private_slug', $privateSlug)
                ->with(['host', 'participants'])
                ->first();

            if (!$event) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Event nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

               \Log::info('[DEBUG] showByPrivateSlug', [
                   'userId' => $userId,
                   'event_host_id' => $event->host_id,
                   'event_visibility' => $event->visibility,
               ]);

            // Zugriff: Öffentlich, Host, Teilnehmer oder eingeloggter User (nur Details)
               $isHost = $userId && (string)$event->host_id === (string)$userId;
               \Log::info('[DEBUG] showByPrivateSlug isHost', [
                   'isHost' => $isHost,
                   'userId' => $userId,
                   'event_host_id' => $event->host_id,
               ]);
            $isParticipant = $userId && $event->participants()->where('user_id', $userId)->exists();
            $isPublic = $event->visibility === 'public';

            // Wenn das Event privat ist und kein User eingeloggt ist, 403 zurückgeben
            if ($event->visibility === 'private' && !$userId && !$isHost) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie müssen eingeloggt sein, um dieses Event zu sehen.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            if (!$isPublic && !$userId && !$isHost && !$isParticipant) {
                // Nicht eingeloggt und kein Zugriff
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie haben keinen Zugriff auf dieses Event.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Info für Frontend: Darf User teilnehmen?
            $canParticipate = false;
            if ($userId && !$isHost && !$isParticipant && $event->visibility === 'private') {
                $canParticipate = true;
            }

            return response()->json([
                'data' => new EventResource($event),
                'meta' => [
                    'can_participate' => $canParticipate,
                    'is_participant' => $isParticipant,
                    'is_host' => $isHost,
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
     * Event verlassen (öffentlich)
     */
    public function leave(Request $request, $publicSlug): JsonResponse
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
        $event = Event::where('public_slug', $publicSlug)
            ->where('visibility', 'public')
            ->where('is_archived', false)
            ->first();
        if (!$event) {
            return response()->json([
                'status' => 404,
                'error' => 'Not Found',
                'message' => 'Event nicht gefunden oder nicht öffentlich verfügbar.',
                'request_id' => Str::ulid(),
            ], 404);
        }
        // Host kann sich nicht abmelden
        if ($event->host_id == $userId) {
            return response()->json([
                'status' => 400,
                'error' => 'Bad Request',
                'message' => 'Der Host kann das Event nicht verlassen.',
                'request_id' => Str::ulid(),
            ], 400);
        }
        $event->participants()->detach($userId);
        return response()->json([
            'message' => 'Sie haben das Event verlassen.',
        ]);
    }

    /**
     * Privates Event verlassen
     */
    public function leavePrivate(Request $request, $eventId): JsonResponse
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
        $event = Event::where('id', $eventId)
            ->where('visibility', 'private')
            ->where('is_archived', false)
            ->first();
        if (!$event) {
            return response()->json([
                'status' => 404,
                'error' => 'Not Found',
                'message' => 'Privates Event nicht gefunden.',
                'request_id' => Str::ulid(),
            ], 404);
        }
        // Host kann sich nicht abmelden
        if ($event->host_id == $userId) {
            return response()->json([
                'status' => 400,
                'error' => 'Bad Request',
                'message' => 'Der Host kann das Event nicht verlassen.',
                'request_id' => Str::ulid(),
            ], 400);
        }
        $event->participants()->detach($userId);
        return response()->json([
            'message' => 'Sie haben das Event verlassen.',
        ]);
    }
}
