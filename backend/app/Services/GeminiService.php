<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function embedding($text)
    {
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={$this->apiKey}",
            [
                "content" => [
                    "parts" => [
                        ["text" => $text]
                    ]
                ]
            ]
        );

        return $response['embedding']['values'] ?? [];
    }
}