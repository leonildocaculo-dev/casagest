<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registo de novo utilizador (Cliente ou Proprietário)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(['proprietario', 'cliente'])],
        ]);

        /** @var User $user */
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'ativo',
            'email_verified_at' => app()->environment('local') ? now() : null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        \App\Services\AuditLogService::log('registo', $user->id, 'User', $user->id, ['role' => $user->role, 'email' => $user->email]);

        event(new \Illuminate\Auth\Events\Registered($user));

        return response()->json([
            'message' => 'Registo efetuado com sucesso.',
            'user' => $user,
            'token' => $token,
            'favorite_imovel_ids' => [],
        ], 201);
    }

    /**
     * Autenticação de utilizador
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        if ($user->status !== 'ativo') {
            throw ValidationException::withMessages([
                'email' => ['A sua conta está inativa. Contacte o administrador.'],
            ]);
        }

        // Criar token para pedidos API / SPA
        $token = $user->createToken('auth_token')->plainTextToken;

        \App\Services\AuditLogService::log('login', $user->id, 'User', $user->id, ['email' => $user->email]);

        return response()->json([
            'message' => 'Login efetuado com sucesso.',
            'user' => $user,
            'token' => $token,
            'favorite_imovel_ids' => $user->isCliente() ? $user->favoritos()->pluck('imoveis.id')->toArray() : [],
        ]);
    }

    /**
     * Obter dados do utilizador autenticado
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $favorite_imovel_ids = [];
        if ($user && $user->isCliente()) {
            $favorite_imovel_ids = $user->favoritos()->pluck('imoveis.id')->toArray();
        }

        return response()->json([
            'user' => $user,
            'favorite_imovel_ids' => $favorite_imovel_ids,
        ]);
    }

    /**
     * Atualizar o perfil do utilizador autenticado
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'current_password' => ['nullable', 'required_with:password', 'string'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if (!empty($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['A senha atual está incorreta.'],
                ]);
            }
            $user->password = Hash::make($validated['password']);
        }

        $user->name = $validated['name'];
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        $user->save();

        \App\Services\AuditLogService::log('atualizacao_perfil', $user->id, 'User', $user->id, ['name' => $user->name, 'password_changed' => !empty($validated['password'])]);

        return response()->json([
            'message' => 'Perfil atualizado com sucesso.',
            'user' => $user,
        ]);
    }

    /**
     * Terminar sessão (Logout)
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        // Apaga o token atual se existir
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sessão terminada com sucesso.',
        ]);
    }

    /**
     * Reenviar email de verificação
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-mail já verificado.'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'E-mail de verificação reenviado.']);
    }

    /**
     * Validar e-mail a partir do URL do frontend
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'url'],
        ]);

        $url = $request->input('url');
        
        // Vamos extrair a assinatura e os IDs do URL e validá-los
        // A forma mais segura é simular a Request para a rota
        try {
            $parsedUrl = parse_url($url);
            parse_str($parsedUrl['query'] ?? '', $query);

            if (!isset($query['signature']) || !isset($query['expires'])) {
                return response()->json(['message' => 'Link inválido ou mal formatado.'], 400);
            }

            // O ID do utilizador está no URL (path) ex: /api/email/verify/1/hash
            preg_match('/verify\/(\d+)\/(.+)/', $parsedUrl['path'] ?? '', $matches);
            
            if (count($matches) < 3) {
                return response()->json(['message' => 'Link de verificação inválido.'], 400);
            }

            $userId = $matches[1];
            $user = User::findOrFail($userId);

            if ($user->hasVerifiedEmail()) {
                return response()->json(['message' => 'E-mail já verificado.', 'already_verified' => true]);
            }

            // Validar a assinatura (URL HasValidSignature falha se recriarmos a request de forma suja, 
            // então validamos manualmente ou fazemos dispatch). Vamos fazer dispatch interno.
            $internalRequest = Request::create($url, 'GET');
            
            if (! $internalRequest->hasValidSignature()) {
                return response()->json(['message' => 'Link de verificação inválido ou expirado.'], 400);
            }

            if (! hash_equals((string) $matches[2], sha1($user->getEmailForVerification()))) {
                return response()->json(['message' => 'Hash de verificação inválida.'], 400);
            }

            $user->markEmailAsVerified();
            event(new \Illuminate\Auth\Events\Verified($user));

            return response()->json(['message' => 'E-mail verificado com sucesso.']);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao processar link de verificação.', 'error' => $e->getMessage()], 400);
        }
    }
}
