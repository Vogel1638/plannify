<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Health Check Route (ohne Session-Middleware)
Route::get('/ping', fn () => response()->json(['pong' => true]))->middleware([]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', function () {
        return Inertia::render('Profile/Edit');
    })->name('profile.edit');
});

Route::get('/settings', function () {
    return Inertia::render('Settings');
})->name('settings');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
