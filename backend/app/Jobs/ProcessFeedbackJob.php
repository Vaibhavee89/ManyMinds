<?php

namespace App\Jobs;

use App\Models\AiProfilePromptVersion;
use App\Models\MessageFeedback;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class ProcessFeedbackJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $feedback;

    public function __construct(MessageFeedback $feedback)
    {
        $this->feedback = $feedback;
    }

    public function handle(): void
    {
        $feedback = $this->feedback->load(['message', 'conversation.aiProfile.activePromptVersion']);
        $profile = $feedback->conversation->aiProfile;
        $activeVersion = $profile->activePromptVersion;

        $prompt = "You are an AI personality tuner. A user provided feedback on a companion's response.
        
Current System Prompt: {$activeVersion->system_prompt}
Current Tuning: {$activeVersion->tuning_summary}

User Rating: {$feedback->rating}/5
User Tags: " . json_encode($feedback->tags_json) . "
User Comment: {$feedback->comment}

Assistant Message that was rated: {$feedback->message->body}

Task: Provide a short, structured update to the 'Tuning Rules' for this personality. 
Focus on what the AI should do differently based on this feedback. 
Be concise. Output ONLY the new tuning summary text.";

        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o', // Use a smarter model for tuning
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a professional persona engineer.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            $newTuning = $response->choices[0]->message->content;

            // Create new version
            $version = AiProfilePromptVersion::create([
                'ai_profile_id' => $profile->id,
                'system_prompt' => $activeVersion->system_prompt, // Keep base system prompt for now
                'tuning_summary' => $newTuning,
                'created_from_feedback_id' => $feedback->id,
            ]);

            // Activate new version
            $profile->update(['active_prompt_version_id' => $version->id]);

        } catch (\Exception $e) {
            Log::error("Failed to process feedback tuning: " . $e->getMessage());
        }
    }
}
