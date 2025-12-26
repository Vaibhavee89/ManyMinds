<?php

namespace App\Services;

use App\Models\AiProfile;
use App\Models\Conversation;
use App\Models\Message;

class PromptBuilderService
{
    public function build(Conversation $conversation, string $userMessage): array
    {
        $profile = $conversation->aiProfile;
        $activeVersion = $profile->activePromptVersion;

        $messages = [];

        // 1. System Prompt
        $messages[] = [
            'role' => 'system',
            'content' => $activeVersion->system_prompt ?? $profile->base_system_prompt,
        ];

        // 2. Tuning Rules (could be part of system prompt or separate)
        if ($activeVersion->tuning_summary) {
            $messages[] = [
                'role' => 'system',
                'content' => "Current Tuning/User Preferences: " . $activeVersion->tuning_summary,
            ];
        }

        // 3. Conversation History (last 10 messages)
        $history = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse();

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg->sender_type === 'user' ? 'user' : 'assistant',
                'content' => $msg->body,
            ];
        }

        // 4. Latest User Message
        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        return $messages;
    }
}
