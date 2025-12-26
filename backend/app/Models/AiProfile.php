<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiProfile extends Model
{
    protected $fillable = [
        'user_id',
        'display_name',
        'avatar_url',
        'base_personality_json',
        'base_system_prompt',
        'active_prompt_version_id',
    ];

    protected $casts = [
        'base_personality_json' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function promptVersions(): HasMany
    {
        return $this->hasMany(AiProfilePromptVersion::class);
    }

    public function activePromptVersion(): BelongsTo
    {
        return $this->belongsTo(AiProfilePromptVersion::class, 'active_prompt_version_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function memories(): HasMany
    {
        return $this->hasMany(AiMemory::class);
    }
}
