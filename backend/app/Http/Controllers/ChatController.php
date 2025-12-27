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

        // 3. Prepare Streaming Response
        return response()->stream(function () use ($conversation, $prompt) {
            $stream = OpenAI::chat()->createStreamed([
                'model' => 'gpt-4o-mini',
                'messages' => $prompt,
                'max_tokens' => 500,
            ]);

            $fullText = "";

            foreach ($stream as $response) {
                $delta = $response->choices[0]->delta->content ?? '';
                $fullText .= $delta;

                if ($delta !== '') {
                    echo "data: " . json_encode(['text' => $delta]) . "\n\n";
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }
            }

            // 4. Store Assistant Message (after streaming is complete)
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_type' => 'assistant',
                'body' => $fullText,
            ]);

            // 5. Update Conversation last_message_at
            $conversation->update(['last_message_at' => now()]);

            echo "event: close\ndata: [DONE]\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable buffering for Nginx
        ]);
    }
}
