<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\BringItemController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\NotificationController;



// Auth Routes (ohne Middleware für Registrierung und Login)
Route::post('/v1/auth/register', [AuthController::class, 'register'])->name('api.v1.auth.register');
Route::post('/v1/auth/login', [AuthController::class, 'login'])->name('api.v1.auth.login');

// Public Event Routes (ohne Middleware)
Route::get('/v1/events/public', [EventController::class, 'publicIndex'])->name('api.v1.events.public');
Route::get('/v1/events/public/{publicSlug}', [EventController::class, 'show'])->name('api.v1.events.show');


// Private Event Details (jetzt geschützt durch Sanctum)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/events/private/{privateSlug}', [EventController::class, 'showByPrivateSlug'])->name('api.v1.events.private.show');
});

// Protected Routes (mit Sanctum Middleware)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Debug Route (geschützt)
    Route::get('/auth/debug-token', [AuthController::class, 'debugToken'])->name('api.v1.auth.debug-token');
    
    // Auth Routes (geschützt)
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
    Route::put('/auth/profile', [AuthController::class, 'updateProfile'])->name('api.v1.auth.profile.update');
    Route::put('/auth/notifications', [AuthController::class, 'updateNotificationPreferences'])->name('api.v1.auth.notifications.update');
    Route::put('/auth/privacy', [AuthController::class, 'updatePrivacySettings'])->name('api.v1.auth.privacy.update');
    
    // User Profile Routes (geschützt)
    Route::get('/users/{userId}', [AuthController::class, 'showProfile'])->name('api.v1.users.show');
    
    // User Bring-Items Routes (geschützt)
    Route::get('/users/{userId}/bring-items', [AuthController::class, 'getUserBringItems'])->name('api.v1.users.bring-items');
    Route::get('/users/{userId}/bring-items/created', [AuthController::class, 'getUserCreatedBringItems'])->name('api.v1.users.bring-items.created');
    Route::get('/users/{userId}/bring-items/claimed', [AuthController::class, 'getUserClaimedBringItems'])->name('api.v1.users.bring-items.claimed');
    
    // Event Routes (geschützt)
    Route::get('/events', [EventController::class, 'index'])->name('api.v1.events.index');
    Route::post('/events', [EventController::class, 'store'])->name('api.v1.events.store');
    // Route::get('/events/{eventId}', ...) entfernt, private Events laufen jetzt über privateSlug
    Route::put('/events/{eventId}', [EventController::class, 'update'])->name('api.v1.events.update');
    Route::delete('/events/{eventId}', [EventController::class, 'destroy'])->name('api.v1.events.destroy');
    
    // Event Join/Leave Routes (geschützt)
    Route::post('/events/public/{publicSlug}/join', [EventController::class, 'join'])->name('api.v1.events.join');
    Route::post('/events/{eventId}/join', [EventController::class, 'joinPrivate'])->name('api.v1.events.join-private');
    Route::post('/events/public/{publicSlug}/leave', [EventController::class, 'leave'])->name('api.v1.events.leave');
    Route::post('/events/{eventId}/leave', [EventController::class, 'leavePrivate'])->name('api.v1.events.leave-private');
    
    // Participant Management (geschützt, nur Host)
    Route::post('/events/{eventId}/participants/{userId}/approve', [EventController::class, 'approveParticipant'])->name('api.v1.events.approve-participant');
    
    // Bring Items (Mitbringliste) Routes
    Route::get('/events/{eventId}/bring-items', [BringItemController::class, 'index'])->name('api.v1.bring-items.index');
    Route::post('/events/{eventId}/bring-items', [BringItemController::class, 'store'])->name('api.v1.bring-items.store');
    Route::put('/events/{eventId}/bring-items/{itemId}', [BringItemController::class, 'update'])->name('api.v1.bring-items.update');
    Route::delete('/events/{eventId}/bring-items/{itemId}', [BringItemController::class, 'destroy'])->name('api.v1.bring-items.destroy');
    Route::post('/events/{eventId}/bring-items/{itemId}/claim', [BringItemController::class, 'claim'])->name('api.v1.bring-items.claim');
    Route::post('/events/{eventId}/bring-items/{itemId}/unclaim', [BringItemController::class, 'unclaim'])->name('api.v1.bring-items.unclaim');
    
    // Comment Routes (geschützt)
    Route::get('/events/{eventId}/comments', [CommentController::class, 'index'])->name('api.v1.comments.index');
    Route::post('/events/{eventId}/comments', [CommentController::class, 'store'])->name('api.v1.comments.store');
    Route::get('/events/{eventId}/comments/{commentId}', [CommentController::class, 'show'])->name('api.v1.comments.show');
    Route::put('/events/{eventId}/comments/{commentId}', [CommentController::class, 'update'])->name('api.v1.comments.update');
    Route::delete('/events/{eventId}/comments/{commentId}', [CommentController::class, 'destroy'])->name('api.v1.comments.destroy');
    
    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('api.v1.notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('api.v1.notifications.unread-count');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('api.v1.notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.v1.notifications.mark-all-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('api.v1.notifications.destroy');
});
