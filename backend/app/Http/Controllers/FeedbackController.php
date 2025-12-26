<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MessageFeedback;
use App\Jobs\ProcessFeedbackJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    public function store(Request $request, Message $message)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'tags_json' => 'nullable|array',
            'comment' => 'nullable|string|max:1000',
        ]);

        $feedback = MessageFeedback::create([
            'conversation_id' => $message->conversation_id,
            'message_id' => $message->id,
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'tags_json' => $validated['tags_json'] ?? [],
            'comment' => $validated['comment'] ?? null,
        ]);

        // Dispatch background job to tune personality
        ProcessFeedbackJob::dispatch($feedback);

        return response()->json($feedback, 201);
    }
}
