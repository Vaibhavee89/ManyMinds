<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Services\RealtimeService;
use Illuminate\Http\Request;

class RealtimeController extends Controller
{
    protected $realtimeService;

    public function __construct(RealtimeService $realtimeService)
    {
        $this->realtimeService = $realtimeService;
    }

    /**
     * Generate an ephemeral token for a voice session.
     */
    public function createSession(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $sessionData = $this->realtimeService->createSession($conversation);

        if (!$sessionData) {
            return response()->json(['error' => 'Failed to create realtime session'], 500);
        }

        return response()->json($sessionData);
    }
}
