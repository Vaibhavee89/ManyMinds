<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class DalleImageService
{
    /**
     * Generate an image using DALL-E 3.
     */
    public function generate(string $prompt): ?string
    {
        try {
            Log::info('Triggering DALL-E 3 Image Generation', ['prompt' => $prompt]);

            $response = OpenAI::images()->create([
                'model' => 'dall-e-3',
                'prompt' => $prompt,
                'n' => 1,
                'size' => '1024x1024',
                'response_format' => 'url', // We can also use b64_json
            ]);

            $url = $response->data[0]->url ?? null;

            if ($url) {
                Log::info('DALL-E 3 Image successfully generated.');
                // Note: OpenAI URLs are temporary (expire in 1 hour).
                // For a production app, you would download and save to local storage/S3.
                // For this prototype, we'll return the URL directly.
                return $url;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('DALL-E 3 Image Generation Exception: ' . $e->getMessage());
            return null;
        }
    }
}
