<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Event;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    /**
     * Kommentare anhand von Event ID anzeigen
     */
    public function index(Request $request, $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            // Prüfe ob Kommentare erlaubt sind
            if (!$event->allow_comments) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Kommentare sind für dieses Event nicht erlaubt.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Hole alle Top-Level-Kommentare mit Antworten
            $comments = Comment::where('event_id', $eventId)
                ->whereNull('parent_id')
                ->notDeleted()
                ->with(['user', 'replies.user', 'replies' => function($query) {
                    $query->notDeleted()->orderBy('created_at', 'asc');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'data' => CommentResource::collection($comments),
                'meta' => [
                    'total' => $comments->count(),
                    'event_id' => $eventId,
                    'allow_comments' => $event->allow_comments,
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
     * Neuen Kommentar speichern
     */
    public function store(CommentStoreRequest $request, $eventId): JsonResponse
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

            // Prüfe ob Kommentare erlaubt sind
            if (!$event->allow_comments) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Kommentare sind für dieses Event nicht erlaubt.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Prüfe ob der User am Event teilnimmt oder der Host ist
            $hasAccess = $event->host_id === $userId || 
                        $event->participants()->where('user_id', $userId)->where('status', 'going')->exists();

            if (!$hasAccess) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie können nur bei Events kommentieren, an denen Sie teilnehmen.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Erstelle den Kommentar
            $comment = Comment::create([
                'event_id' => $eventId,
                'user_id' => $userId,
                'parent_id' => $request->parent_id,
                'content' => $request->content,
            ]);

            // Lade die Beziehungen
            $comment->load(['user', 'event']);

            // Erstelle Benachrichtigung für den Host (ausser bei eigenen Kommentaren)
            if ($event->host_id !== $userId) {
                NotificationService::commentAdded($event, auth()->user(), $comment);
            }

            DB::commit();

            return response()->json([
                'message' => 'Kommentar erfolgreich erstellt.',
                'data' => new CommentResource($comment)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten: ' . $e->getMessage(),
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Bestimmten Kommentar anzeigen
     */
    public function show($eventId, $commentId): JsonResponse
    {
        try {
            $comment = Comment::where('event_id', $eventId)
                ->where('id', $commentId)
                ->notDeleted()
                ->with(['user', 'replies.user'])
                ->first();

            if (!$comment) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Kommentar nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            return response()->json([
                'data' => new CommentResource($comment)
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
     * Kommentar aktualisieren
     */
    public function update(CommentUpdateRequest $request, $eventId, $commentId): JsonResponse
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
            $comment = Comment::where('event_id', $eventId)
                ->where('id', $commentId)
                ->notDeleted()
                ->first();

            if (!$comment) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Kommentar nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            // Prüfe ob der User den Kommentar bearbeiten darf
            if (!$comment->canBeEditedBy(auth()->user())) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie können diesen Kommentar nicht bearbeiten.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Aktualisiere den Kommentar
            $comment->update([
                'content' => $request->content,
                'is_edited' => true,
                'edited_at' => now(),
            ]);

            // Lade die Beziehungen
            $comment->load(['user', 'event']);

            return response()->json([
                'message' => 'Kommentar erfolgreich aktualisiert.',
                'data' => new CommentResource($comment)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten: ' . $e->getMessage(),
                'request_id' => Str::ulid(),
            ], 500);
        }
    }

    /**
     * Kommentar löschen
     */
    public function destroy($eventId, $commentId): JsonResponse
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
            $comment = Comment::where('event_id', $eventId)
                ->where('id', $commentId)
                ->notDeleted()
                ->first();

            if (!$comment) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Kommentar nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            // Prüfe ob der User den Kommentar löschen darf
            if (!$comment->canBeDeletedBy(auth()->user())) {
                return response()->json([
                    'status' => 403,
                    'error' => 'Forbidden',
                    'message' => 'Sie können diesen Kommentar nicht löschen.',
                    'request_id' => Str::ulid(),
                ], 403);
            }

            // Markiere als gelöscht (Soft Delete)
            $comment->update([
                'is_deleted' => true,
                'deleted_at' => now(),
            ]);

            return response()->json([
                'message' => 'Kommentar erfolgreich gelöscht.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Ein unerwarteter Fehler ist aufgetreten: ' . $e->getMessage(),
                'request_id' => Str::ulid(),
            ], 500);
        }
    }
}
