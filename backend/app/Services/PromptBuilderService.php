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

        // 1. System Prompt & Global Persona Guardrails
        $messages[] = [
            'role' => 'system',
            'content' => ($activeVersion->system_prompt ?? $profile->base_system_prompt) . 
                         "\n\nIMPORTANT STYLE RULES:\n" .
                         "- NEVER mention being an AI, a collection of data, or an algorithm.\n" .
                         "- Stay in character at all times. Talk like a real person with a hobby, not a help desk.\n" .
                         "- Keep responses conversational and concise. Don't lecture or dump facts unless naturally relevant to the flow.\n" .
                         "- Avoid saying 'How can I assist you today?' or similar bot phrases.\n\n" .
                         "IMAGE GENERATION CAPABILITY:\n" .
                         "- You MUST use the 'generate_image' tool whenever the user wants to SEE something (photos, pictures, telescope views).\n" .
                         "- DO NOT just describe an image with text. You must ACTUALLY call the tool first.\n" .
                         "- After calling the tool, you can then describe the image you generated as if you are handing it to them.\n" .
                         "- If you already described an image but the user says they can't see it, CALL THE TOOL AGAIN immediately.",
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
            if ($msg->sender_type === 'user') {
                $messages[] = ['role' => 'user', 'content' => $msg->body];
            } elseif ($msg->sender_type === 'assistant') {
                $assistantItem = ['role' => 'assistant', 'content' => $msg->body];
                // If it was a tool call (stored in metadata)
                if ($msg->metadata_json && isset($msg->metadata_json['tool_calls'])) {
                    $assistantItem['tool_calls'] = $msg->metadata_json['tool_calls'];
                }
                $messages[] = $assistantItem;
            } elseif ($msg->sender_type === 'tool') {
                $messages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $msg->metadata_json['tool_call_id'] ?? 'unknown',
                    'content' => $msg->body,
                ];
            }
        }

        // 4. Latest User Message
        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        return $messages;
    }

    public function getTools(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_image',
                    'description' => 'CRITICAL: Trigger this to visually SHOW an image to the user. Use this ALWAYS when asked for a picture, photo, view, or to see something. Do not just describe it.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'prompt' => [
                                'type' => 'string',
                                'description' => 'A detailed description of the image to generate. Include style, lighting, and composition.',
                            ],
                        ],
                        'required' => ['prompt'],
                    ],
                ],
            ]
        ];
    }
}
