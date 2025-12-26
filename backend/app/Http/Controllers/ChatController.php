<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\PromptBuilderService;
use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;

class ChatController extends Controller
{
    protected $promptBuilder;

    public function __construct(PromptBuilderService $promptBuilder)
    {
        $this->promptBuilder = $promptBuilder;
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        // 1. Store User Message
        $userMsg = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'user',
            'body' => $validated['text'],
        ]);

        // 2. Build Prompt
        $prompt = $this->promptBuilder->build($conversation, $validated['text']);

        // 3. Call OpenAI
        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => $prompt,
            'max_tokens' => 500,
        ]);

        $assistantText = $response->choices[0]->message->content;

        // 4. Store Assistant Message
        $assistantMsg = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'assistant',
            'body' => $assistantText,
            'metadata_json' => [
                'model' => $response->model,
                'usage' => $response->usage,
            ],
        ]);

        // 5. Update Conversation last_message_at
        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'user_message' => $userMsg,
            'assistant_message' => $assistantMsg,
        ]);
    }
}
