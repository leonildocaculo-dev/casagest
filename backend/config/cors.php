<?php

/*
|------------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS)
|------------------------------------------------------------------------------
| O frontend corre noutro dominio (Cloudflare) e esta API corre no VPS. Sem
| esta configuracao correcta o navegador bloqueia todos os pedidos.
|
| Regra que nao se quebra: com `supports_credentials => true` — necessario para
| a autenticacao por cookie do Sanctum — a especificacao de CORS PROIBE
| `allowed_origins => ['*']`. O navegador rejeita a resposta e o login falha,
| mesmo que a API responda 200. Por isso a lista e sempre explicita.
|
| Em producao a unica origem permitida e FRONTEND_URL. As entradas de
| localhost so aparecem quando APP_ENV=local.
*/

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL'),
        env('APP_ENV') === 'local' ? 'http://localhost:3000' : null,
        env('APP_ENV') === 'local' ? 'http://127.0.0.1:3000' : null,
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Obrigatorio para a autenticacao por cookie do Sanctum. Se a aplicacao
    // usar apenas tokens Bearer, manter true nao tem efeito negativo.
    'supports_credentials' => true,

];
