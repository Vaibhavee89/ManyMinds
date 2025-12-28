<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiImageService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict';

    public function __construct()
    {
        $this->apiKey = config('services.google.api_key');
    }

    public function generate(string $prompt): ?string
    {
        if (!$this->apiKey) {
            Log::error('Gemini API key not configured.');
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '?key=' . $this->apiKey, [
                'instances' => [
                    ['prompt' => $prompt]
                ],
                'parameters' => [
                    'sampleCount' => 1,
                    // You can add more parameters here if needed (size, etc)
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini Image Generation failed: ' . $response->body());
                return null;
            }

            $data = $response->json();
            
            // Imagen 3 in AI Studio usually returns a base64 string or a GCS path.
            // For simplicity in this demo, it often returns the base64 in predictions[0].bytesBase64Encoded
            $base64 = $data['predictions'][0]['bytesBase64Encoded'] ?? null;

            if ($base64) {
                Log::info('Gemini Image successfully generated.');
                // In a real app, you'd save this to storage (S3/Local) and return the URL.
                // For this prototype, we'll return a data URI for quick display, 
                // but usually, saving to storage is better.
                return 'data:image/png;base64,' . $base64;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Gemini Image Generation Exception: ' . $e->getMessage());
            return null;
        }
    }
}
