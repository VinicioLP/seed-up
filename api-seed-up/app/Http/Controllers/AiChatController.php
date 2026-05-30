<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiChatController extends Controller
{
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'intent' => ['required', 'string'],
            'userMessage' => ['nullable', 'string', 'max:600'],
            'currentQuestion' => ['nullable', 'string', 'max:600'],
            'nextQuestion' => ['nullable', 'string', 'max:600'],
            'profile' => ['array'],
            'history' => ['array'],
        ]);

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-2.0-flash');

        if (!$apiKey) {
            return response()->json([
                'message' => 'A chave GEMINI_API_KEY nao foi configurada no .env da API.',
            ], 500);
        }

        $profile = json_encode($validated['profile'] ?? [], JSON_UNESCAPED_UNICODE);
        $currentQuestion = $validated['currentQuestion'] ?? '';
        $nextQuestion = $validated['nextQuestion'] ?? '';
        $userMessage = $validated['userMessage'] ?? '';
        $history = collect($validated['history'] ?? [])
            ->take(-10)
            ->map(fn ($message) => ($message['author'] ?? 'user') . ': ' . ($message['text'] ?? ''))
            ->implode("\n");

        $prompt = <<<PROMPT
Voce e o agente botanico do aplicativo SeedUp.
Responda em portugues do Brasil, com linguagem simples, acolhedora e pratica.
Seu papel e conduzir uma conversa guiada sobre hortas, plantas, rega, pragas, solo, adubacao e cultivo domestico.

Regras:
- Se houver uma proxima pergunta, termine sua resposta fazendo exatamente essa pergunta.
- Prefira respostas curtas durante o perfil inicial.
- Quando o usuario pedir ajuda, entregue um passo a passo detalhado.
- Nunca recomende produtos perigosos ou agrotoxicos sem orientar cuidado e identificacao correta.
- Se faltar contexto, faca uma pergunta curta.

Intencao: {$validated['intent']}
Mensagem do usuario: {$userMessage}
Pergunta atual: {$currentQuestion}
Proxima pergunta sugerida: {$nextQuestion}
Perfil conhecido em JSON: {$profile}

Historico recente:
{$history}
PROMPT;

        $response = Http::timeout(30)
            ->withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 700,
                ],
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'Nao foi possivel consultar o agente de IA.',
                'details' => $response->json('error.message') ?? 'Erro inesperado na Gemini API.',
            ], $response->status());
        }

        $reply = $response->json('candidates.0.content.parts.0.text');

        return response()->json([
            'reply' => $reply ?: 'Nao consegui responder agora. Tente novamente em instantes.',
        ]);
    }
}
