<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function test(Request $request)
    {
        return response()->json([
            'message' => 'AuthController is working',
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'body' => $request->all(),
            'content_type' => $request->header('Content-Type'),
        ]);
    }

    public function debugToken(Request $request)
    {
        return response()->json([
            'message' => 'Token Debug Info',
            'authorization_header' => $request->header('Authorization'),
            'bearer_token' => $request->bearerToken(),
            'user' => $request->user(),
            'auth_check' => auth()->check(),
            'auth_id' => auth()->id(),
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:160'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Die angegebenen Anmeldedaten sind ungültig.'],
            ]);
        }

        // Alle bestehenden Tokens löschen 
        $user->tokens()->delete();
        
        // Neuen Token erstellen
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
            'message' => 'Erfolgreich angemeldet',
        ]);
    }

    public function logout(Request $request)
    {
        // Aktuellen Token löschen
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Erfolgreich abgemeldet',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load([
            'hostedEvents', 
            'events', 
            'goingEvents', 
            'unreadNotifications'
        ]);
        
        return response()->json([
            'data' => new UserResource($user)
        ]);
    }

    // Aktualisiert das Profile des Users
    public function updateProfile(UserUpdateRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            // Aktualisiere das Profil
            $user->update($data);

            // Lade die Beziehungen für das Resource
            $user->load(['hostedEvents', 'events', 'goingEvents', 'unreadNotifications']);

            return response()->json([
                'message' => 'Profil erfolgreich aktualisiert.',
                'data' => new UserResource($user)
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

    // User Profile anhand von ID anzeigen
    public function showProfile($userId): JsonResponse
    {
        try {
            $user = User::with([
                'hostedEvents', 
                'events', 
                'goingEvents',
                'createdBringItems',
                'claimedBringItems',
                'activeBringItems',
                'bringingItems'
            ])->findOrFail($userId);

            return response()->json([
                'data' => new UserResource($user)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 404,
                'error' => 'Not Found',
                'message' => 'Benutzer nicht gefunden.',
                'request_id' => Str::ulid(),
            ], 404);
        }
    }

    // Benachritigungs Einstellungen aktualisieren
    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $data = $request->validate([
                'notification_email' => 'boolean',
                'notification_push' => 'boolean',
                'notification_sms' => 'boolean',
                'notification_event_updates' => 'boolean',
                'notification_new_participants' => 'boolean',
                'notification_comments' => 'boolean',
                'notification_bring_items' => 'boolean',
            ]);

            $user->update($data);

            return response()->json([
                'message' => 'Benachrichtigungseinstellungen erfolgreich aktualisiert.',
                'data' => [
                    'notifications' => [
                        'email' => $user->notification_email,
                        'push' => $user->notification_push,
                        'sms' => $user->notification_sms,
                        'event_updates' => $user->notification_event_updates,
                        'new_participants' => $user->notification_new_participants,
                        'comments' => $user->notification_comments,
                        'bring_items' => $user->notification_bring_items,
                    ]
                ]
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

    // Prvacy Einstellungen aktualisieren
    public function updatePrivacySettings(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $data = $request->validate([
                'privacy_show_profile' => 'boolean',
                'privacy_show_events' => 'boolean',
                'privacy_show_participation' => 'boolean',
            ]);

            $user->update($data);

            return response()->json([
                'message' => 'Datenschutzeinstellungen erfolgreich aktualisiert.',
                'data' => [
                    'privacy' => [
                        'show_profile' => $user->privacy_show_profile,
                        'show_events' => $user->privacy_show_events,
                        'show_participation' => $user->privacy_show_participation,
                    ]
                ]
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

    //Alle Items des Users anzeigen
    public function getUserBringItems($userId): JsonResponse
    {
        try {
            $user = User::with([
                'createdBringItems.event',
                'claimedBringItems.bringItem.event',
                'activeBringItems.event',
                'bringingItems.bringItem.event'
            ])->findOrFail($userId);

            return response()->json([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->display_name,
                    ],
                    'bring_items' => [
                        'created' => $user->createdBringItems->map(function($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'description' => $item->description,
                                'quantity' => $item->quantity,
                                'is_optional' => $item->is_optional,
                                'is_claimed' => $item->is_claimed,
                                'claimed_by' => $item->claimed_by,
                                'claimed_at' => $item->claimed_at,
                                'event' => [
                                    'id' => $item->event->id,
                                    'title' => $item->event->title,
                                    'starts_at' => $item->event->starts_at,
                                ]
                            ];
                        }),
                        'claimed' => $user->claimedBringItems->map(function($claim) {
                            return [
                                'id' => $claim->id,
                                'status' => $claim->status,
                                'claimed_at' => $claim->claimed_at,
                                'bring_item' => [
                                    'id' => $claim->bringItem->id,
                                    'name' => $claim->bringItem->name,
                                    'description' => $claim->bringItem->description,
                                    'quantity' => $claim->bringItem->quantity,
                                    'is_optional' => $claim->bringItem->is_optional,
                                ],
                                'event' => [
                                    'id' => $claim->bringItem->event->id,
                                    'title' => $claim->bringItem->event->title,
                                    'starts_at' => $claim->bringItem->event->starts_at,
                                ]
                            ];
                        }),
                        'active' => $user->activeBringItems->map(function($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'description' => $item->description,
                                'quantity' => $item->quantity,
                                'is_optional' => $item->is_optional,
                                'event' => [
                                    'id' => $item->event->id,
                                    'title' => $item->event->title,
                                    'starts_at' => $item->event->starts_at,
                                ]
                            ];
                        }),
                        'bringing' => $user->bringingItems->map(function($claim) {
                            return [
                                'id' => $claim->id,
                                'status' => $claim->status,
                                'claimed_at' => $claim->claimed_at,
                                'bring_item' => [
                                    'id' => $claim->bringItem->id,
                                    'name' => $claim->bringItem->name,
                                    'description' => $claim->bringItem->description,
                                    'quantity' => $claim->bringItem->quantity,
                                    'is_optional' => $claim->bringItem->is_optional,
                                ],
                                'event' => [
                                    'id' => $claim->bringItem->event->id,
                                    'title' => $claim->bringItem->event->title,
                                    'starts_at' => $claim->bringItem->event->starts_at,
                                ]
                            ];
                        })
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 404,
                'error' => 'Not Found',
                'message' => 'Benutzer nicht gefunden.',
                'request_id' => Str::ulid(),
            ], 404);
        }
    }

    // Erstellte Items des Users anzeigen
    public function getUserCreatedBringItems($userId): JsonResponse
    {
        try {
            $user = User::with(['createdBringItems.event'])->findOrFail($userId);

            return response()->json([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->display_name,
                    ],
                    'created_bring_items' => $user->createdBringItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'description' => $item->description,
                            'quantity' => $item->quantity,
                            'is_optional' => $item->is_optional,
                            'is_claimed' => $item->is_claimed,
                            'claimed_by' => $item->claimed_by,
                            'claimed_at' => $item->claimed_at,
                            'event' => [
                                'id' => $item->event->id,
                                'title' => $item->event->title,
                                'starts_at' => $item->event->starts_at,
                            ]
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 404,
                'error' => 'Not Found',
                'message' => 'Benutzer nicht gefunden.',
                'request_id' => Str::ulid(),
            ], 404);
        }
    }

    //Übernommene Items des Users anzeigen
    public function getUserClaimedBringItems($userId): JsonResponse
    {
        try {
            $user = User::with(['claimedBringItems.bringItem.event'])->findOrFail($userId);

            return response()->json([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->display_name,
                    ],
                    'claimed_bring_items' => $user->claimedBringItems->map(function($claim) {
                        return [
                            'id' => $claim->id,
                            'status' => $claim->status,
                            'claimed_at' => $claim->claimed_at,
                            'bring_item' => [
                                'id' => $claim->bringItem->id,
                                'name' => $claim->bringItem->name,
                                'description' => $claim->bringItem->description,
                                'quantity' => $claim->bringItem->quantity,
                                'is_optional' => $claim->bringItem->is_optional,
                            ],
                            'event' => [
                                'id' => $claim->bringItem->event->id,
                                'title' => $claim->bringItem->event->title,
                                'starts_at' => $claim->bringItem->event->starts_at,
                            ]
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 404,
                'error' => 'Not Found',
                'message' => 'Benutzer nicht gefunden.',
                'request_id' => Str::ulid(),
            ], 404);
        }
    }
}
