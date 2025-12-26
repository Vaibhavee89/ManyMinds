<?php

namespace App\Policies;

use App\Models\AiProfile;
use App\Models\User;

class AiProfilePolicy
{
    public function view(User $user, AiProfile $aiProfile): bool
    {
        return $user->id === $aiProfile->user_id;
    }

    public function update(User $user, AiProfile $aiProfile): bool
    {
        return $user->id === $aiProfile->user_id;
    }

    public function delete(User $user, AiProfile $aiProfile): bool
    {
        return $user->id === $aiProfile->user_id;
    }
}
