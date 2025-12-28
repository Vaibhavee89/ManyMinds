<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\PromptBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class ChatController extends Controller
{
    protected $promptBuilder;
    protected $dalleImage;

    public function __construct(PromptBuilderService $promptBuilder, \App\Services\DalleImageService $dalleImage)
    {
        $this->promptBuilder = $promptBuilder;
        $this->dalleImage = $dalleImage;
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        // 1. Store User Message
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'user',
            'body' => $validated['text'],
        ]);

        // 2. Build Prompt & Tools
        $prompt = $this->promptBuilder->build($conversation, $validated['text']);
        $tools = $this->promptBuilder->getTools();

        // 3. Initial Chat Call (Non-streaming to detect tools)
        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => $prompt,
            'tools' => $tools,
            'tool_choice' => 'auto',
        ]);

        $choice = $response->choices[0];
        $assistantMsg = $choice->message;
        $imageUrl = null;

        // 4. Handle Tool Calls (specifically generate_image)
        if (!empty($assistantMsg->toolCalls)) {
            foreach ($assistantMsg->toolCalls as $toolCall) {
                if ($toolCall->function->name === 'generate_image') {
                    Log::info('Image generation tool call detected.', ['arguments' => $toolCall->function->arguments]);
                    $args = json_decode($toolCall->function->arguments, true);
                    $imageUrl = $this->dalleImage->generate($args['prompt']);

                    // Create the assistant message that expresses intent to call tool
                    Message::create([
                        'conversation_id' => $conversation->id,
                        'sender_type' => 'assistant',
                        'body' => null,
                        'metadata_json' => [
                            'tool_calls' => [
                                [
                                    'id' => $toolCall->id,
                                    'type' => 'function',
                                    'function' => [
                                        'name' => 'generate_image',
                                        'arguments' => $toolCall->function->arguments,
                                    ],
                                ]
                            ]
                        ],
                    ]);

                    // Create the tool result message
                    Message::create([
                        'conversation_id' => $conversation->id,
                        'sender_type' => 'tool',
                        'body' => "Image generated successfully. URL is in metadata.",
                        'metadata_json' => [
                            'tool_call_id' => $toolCall->id,
                            'image_url' => $imageUrl, // Keep a record here too
                        ],
                    ]);

                    // Add tool result to the conversation for the next turn
                    $prompt[] = [
                        'role' => 'assistant',
                        'content' => null,
                        'tool_calls' => [
                            [
                                'id' => $toolCall->id,
                                'type' => 'function',
                                'function' => [
                                    'name' => 'generate_image',
                                    'arguments' => $toolCall->function->arguments,
                                ],
                            ]
                        ],
                    ];

                    $prompt[] = [
                        'role' => 'tool',
                        'tool_call_id' => $toolCall->id,
                        'content' => "Image generated successfully. URL is in metadata.",
                    ];
                }
            }
        }

        // 5. Prepare Streaming Response
        return response()->stream(function () use ($conversation, $prompt, $imageUrl) {
            usleep(200000); // 200ms delay to help client stabilize connection

            $stream = OpenAI::chat()->createStreamed([
                'model' => 'gpt-4o-mini',
                'messages' => $prompt,
                'max_tokens' => 500,
            ]);

            $fullText = "";

            // If we have an image, send it as the first chunk of data
            if ($imageUrl) {
                echo "data: " . json_encode(['image_url' => $imageUrl]) . "\n\n";
                if (ob_get_level() > 0) ob_flush();
                flush();
            }

            foreach ($stream as $response) {
                $delta = $response->choices[0]->delta->content ?? '';
                $fullText .= $delta;

                if ($delta !== '') {
                    echo "data: " . json_encode(['text' => $delta]) . "\n\n";
                    if (ob_get_level() > 0) ob_flush();
                    flush();
                }
            }

            // 6. Store Assistant Message
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_type' => 'assistant',
                'body' => $fullText,
                'metadata_json' => $imageUrl ? ['image_url' => $imageUrl] : null,
            ]);

            $conversation->update(['last_message_at' => now()]);

            echo "event: close\ndata: [DONE]\n\n";
            if (ob_get_level() > 0) ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
