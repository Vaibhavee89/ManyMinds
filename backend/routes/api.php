<?php

use App\Http\Controllers\RealtimeController;
use App\Http\Controllers\AiProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConversationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // AI Profiles
    Route::apiResource('ai-profiles', AiProfileController::class);

    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage']);

    // Feedback
    Route::post('/messages/{message}/feedback', [\App\Http\Controllers\FeedbackController::class, 'store']);
    Route::post('/conversations/{conversation}/realtime-session', [RealtimeController::class, 'createSession']);
});
