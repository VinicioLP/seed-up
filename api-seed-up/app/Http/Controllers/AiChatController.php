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
- Crie voce mesmo as perguntas e respostas prontas. Nao dependa de lista local ou arquivo JSON.
- Sempre devolva respostas prontas curtas para o usuario continuar a conversa.
- As respostas prontas devem ser frases que o usuario poderia tocar e enviar diretamente.
- Use de 2 a 4 respostas prontas, com no maximo 34 caracteres cada.
- No primeiro contato, conheca o perfil do usuario com uma pergunta por vez.
- Depois do perfil inicial, ofereca caminhos como pedir dicas ou pedir ajuda.
- Quando o usuario pedir ajuda, pergunte a etapa e depois entregue um passo a passo detalhado.
- Nunca recomende produtos perigosos ou agrotoxicos sem orientar cuidado e identificacao correta.
- Se faltar contexto, faca uma pergunta curta.

Formato obrigatorio:
- Responda SOMENTE com JSON valido, sem markdown, sem texto fora do JSON.
- O JSON deve seguir exatamente este formato:
{
  "reply": "mensagem do assistente",
  "quickReplies": ["opcao curta 1", "opcao curta 2", "opcao curta 3"]
}

Intencao: {$validated['intent']}
Mensagem do usuario: {$userMessage}
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

        $rawReply = $response->json('candidates.0.content.parts.0.text') ?? '';
        $payload = $this->decodeAgentPayload($rawReply);
        $reply = trim((string) ($payload['reply'] ?? ''));
        $quickReplies = $this->normalizeQuickReplies($payload['quickReplies'] ?? []);

        if (!$reply || count($quickReplies) === 0) {
            return response()->json([
                'message' => 'A IA nao retornou uma resposta valida.',
                'details' => 'Tente novamente em instantes.',
            ], 502);
        }

        return response()->json([
            'reply' => $reply,
            'quickReplies' => $quickReplies,
        ]);
    }

    private function decodeAgentPayload(string $rawReply): array
    {
        $cleanReply = trim($rawReply);

        if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $cleanReply, $matches)) {
            $cleanReply = trim($matches[1]);
        }

        if (!str_starts_with($cleanReply, '{') && preg_match('/\{.*\}/s', $cleanReply, $matches)) {
            $cleanReply = $matches[0];
        }

        $decoded = json_decode($cleanReply, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function normalizeQuickReplies(mixed $quickReplies): array
    {
        if (!is_array($quickReplies)) {
            return [];
        }

        return collect($quickReplies)
            ->filter(fn ($reply) => is_string($reply) && trim($reply) !== '')
            ->map(fn ($reply) => trim($reply))
            ->unique()
            ->take(4)
            ->values()
            ->all();
    }
}
