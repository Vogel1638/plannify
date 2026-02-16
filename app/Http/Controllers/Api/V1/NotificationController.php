<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * Liste an Benachrichtigungen anzeigen 
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
            // Prüfe zuerst, ob die Tabelle existiert
            if (!\Schema::hasTable('notifications')) {
                return response()->json([
                    'status' => 500,
                    'error' => 'Database Error',
                    'message' => 'Die Notifications-Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.',
                    'request_id' => Str::ulid(),
                ], 500);
            }

            $query = Notification::where('user_id', $userId)
                ->with(['relatedEvent', 'relatedUser'])
                ->orderBy('created_at', 'desc');

            // Filter nach Typ
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter nach gelesen/ungelesen
            if ($request->has('is_read')) {
                $query->where('is_read', $request->boolean('is_read'));
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $notifications = $query->paginate($perPage);

            return response()->json([
                'data' => NotificationResource::collection($notifications),
                'meta' => [
                    'total' => $notifications->total(),
                    'unread_count' => Notification::where('user_id', $userId)->unread()->count(),
                    'read_count' => Notification::where('user_id', $userId)->read()->count(),
                    'current_page' => $notifications->currentPage(),
                    'per_page' => $notifications->perPage(),
                    'last_page' => $notifications->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Notification index error: ' . $e->getMessage(), [
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
     * Benachrichtigung als gelesen markieren
     */
    public function markAsRead($id): JsonResponse
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
            $notification = Notification::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$notification) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Benachrichtigung nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'message' => 'Benachrichtigung als gelesen markiert.',
                'data' => new NotificationResource($notification->fresh())
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
     * Alle Benachrichtigungen als gelesen markieren
     */
    public function markAllAsRead(): JsonResponse
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
            $count = Notification::where('user_id', $userId)
                ->unread()
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            return response()->json([
                'message' => "{$count} Benachrichtigungen als gelesen markiert.",
                'meta' => [
                    'marked_as_read' => $count,
                    'unread_count' => 0,
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
     * Anzahl an ungelesenen Benachrichtigungen anzeigen
     */
    public function unreadCount(): JsonResponse
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
            // Prüfe zuerst, ob die Tabelle existiert
            if (!Schema::hasTable('notifications')) {
                return response()->json([
                    'status' => 500,
                    'error' => 'Database Error',
                    'message' => 'Die Notifications-Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.',
                    'request_id' => Str::ulid(),
                ], 500);
            }

            $count = Notification::where('user_id', $userId)->unread()->count();

            return response()->json([
                'data' => [
                    'unread_count' => $count,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Notification unreadCount error: ' . $e->getMessage(), [
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
     * Benachrichtigung löschen
     */
    public function destroy($id): JsonResponse
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
            $notification = Notification::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$notification) {
                return response()->json([
                    'status' => 404,
                    'error' => 'Not Found',
                    'message' => 'Benachrichtigung nicht gefunden.',
                    'request_id' => Str::ulid(),
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'message' => 'Benachrichtigung gelöscht.',
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
