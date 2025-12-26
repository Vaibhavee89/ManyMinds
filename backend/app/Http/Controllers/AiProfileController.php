<?php

namespace App\Http\Controllers;

use App\Models\AiProfile;
use App\Models\AiProfilePromptVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AiProfileController extends Controller
{
    public function index()
    {
        return AiProfile::where('user_id', Auth::id())
            ->with('activePromptVersion')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'base_personality_json' => 'required|array',
            'base_system_prompt' => 'required|string',
            'avatar_url' => 'nullable|string',
        ]);

        $profile = AiProfile::create([
            'user_id' => Auth::id(),
            'display_name' => $validated['display_name'],
            'avatar_url' => $validated['avatar_url'],
            'base_personality_json' => $validated['base_personality_json'],
            'base_system_prompt' => $validated['base_system_prompt'],
        ]);

        // Create initial prompt version
        $version = AiProfilePromptVersion::create([
            'ai_profile_id' => $profile->id,
            'system_prompt' => $validated['base_system_prompt'],
            'tuning_summary' => 'Initial setup',
        ]);

        $profile->update(['active_prompt_version_id' => $version->id]);

        return $profile->load('activePromptVersion');
    }

    public function show(AiProfile $aiProfile)
    {
        $this->authorize('view', $aiProfile);
        return $aiProfile->load(['activePromptVersion', 'promptVersions']);
    }

    public function update(Request $request, AiProfile $aiProfile)
    {
        $this->authorize('update', $aiProfile);

        $validated = $request->validate([
            'display_name' => 'sometimes|string|max:255',
            'avatar_url' => 'sometimes|nullable|string',
            'base_personality_json' => 'sometimes|array',
        ]);

        $aiProfile->update($validated);

        return $aiProfile;
    }

    public function destroy(AiProfile $aiProfile)
    {
        $this->authorize('delete', $aiProfile);
        $aiProfile->delete();
        return response()->noContent();
    }
}
