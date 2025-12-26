<?php

namespace App\Http\Controllers;

use App\Models\AiProfile;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $query = Conversation::where('user_id', Auth::id());

        if ($request->has('ai_profile_id')) {
            $query->where('ai_profile_id', $request->ai_profile_id);
        }

        return $query->with('aiProfile')->orderBy('last_message_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ai_profile_id' => 'required|exists:ai_profiles,id',
            'title' => 'nullable|string|max:255',
        ]);

        $profile = AiProfile::findOrFail($validated['ai_profile_id']);
        
        // Ensure user owns the profile
        if ($profile->user_id !== Auth::id()) {
            abort(403);
        }

        return Conversation::create([
            'user_id' => Auth::id(),
            'ai_profile_id' => $validated['ai_profile_id'],
            'title' => $validated['title'] ?? 'New Chat with ' . $profile->display_name,
        ]);
    }

    public function messages(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        
        return $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->paginate(50);
    }
}
