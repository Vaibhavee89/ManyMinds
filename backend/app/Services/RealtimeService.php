<?php

namespace App\Services;

use App\Models\Conversation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RealtimeService
{
    /**
     * Create a realtime session token from OpenAI.
     */
    public function createSession(Conversation $conversation): ?array
    {
        try {
            $apiKey = config('services.openai.key');
            
            // Build instructions from profile
            $profile = $conversation->aiProfile;
            $activeVersion = $profile->activePromptVersion;
            $instructions = ($activeVersion->system_prompt ?? $profile->base_system_prompt) . 
                            "\n\nVOICE INTERACTION STYLE:\n" .
                            "- Be warm, conversational, and helpful.\n" .
                            "- Use filler words occasionally ('um', 'uh') to sound more human.\n" .
                            "- Keep responses concise for voice latency.";

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/realtime/sessions', [
                'model' => 'gpt-4o-realtime-preview-2024-12-17',
                'modalities' => ['audio', 'text'],
                'instructions' => $instructions,
                'voice' => 'sage', // sage, coral, ash, ballad, ocean, verse
                'turn_detection' => [
                    'type' => 'server_vad',
                ],
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('OpenAI Realtime Session failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('RealtimeService Exception: ' . $e->getMessage());
            return null;
        }
    }
}
