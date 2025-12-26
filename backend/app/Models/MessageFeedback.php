<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageFeedback extends Model
{
    protected $table = 'message_feedback';

    protected $fillable = [
        'conversation_id',
        'message_id',
        'user_id',
        'rating',
        'tags_json',
        'comment',
    ];

    protected $casts = [
        'tags_json' => 'array',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
