<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiProfilePromptVersion extends Model
{
    protected $fillable = [
        'ai_profile_id',
        'system_prompt',
        'tuning_summary',
        'created_from_feedback_id',
    ];

    public function aiProfile(): BelongsTo
    {
        return $this->belongsTo(AiProfile::class);
    }

    public function feedback(): BelongsTo
    {
        return $this->belongsTo(MessageFeedback::class, 'created_from_feedback_id');
    }
}
