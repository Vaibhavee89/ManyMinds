<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMemory extends Model
{
    protected $fillable = [
        'ai_profile_id',
        'user_id',
        'memory_text',
        'embedding',
        'importance',
        'last_used_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    public function aiProfile(): BelongsTo
    {
        return $this->belongsTo(AiProfile::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
