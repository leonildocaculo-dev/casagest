<?php

/*
|------------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS)
|------------------------------------------------------------------------------
| O frontend corre noutro dominio (Vercel) e esta API corre noutro (Render). Sem
| esta configuracao correcta o navegador bloqueia todos os pedidos.
|
| Regra que nao se quebra: com `supports_credentials => true` — necessario para
| a autenticacao por cookie do Sanctum — a especificacao de CORS PROIBE
| `allowed_origins => ['*']`. O navegador rejeita a resposta e o login falha,
| mesmo que a API responda 200. Por isso a lista e sempre explicita.
|
| Em producao as origens permitidas sao FRONTEND_URL (podendo conter varias
| separadas por virgula). As entradas de localhost so aparecem quando
| APP_ENV=local.
|
| ATENCAO: se FRONTEND_URL nao estiver definida, esta lista fica VAZIA e a API
| bloqueia todos os pedidos do browser sem qualquer mensagem de erro util.
*/

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map('trim', array_merge(
        explode(',', (string) env('FRONTEND_URL')),
        env('APP_ENV') === 'local' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [],
    )))),

    /*
     | Deploys de preview da Vercel recebem um URL diferente a cada commit
     | (ex.: casagest-git-feature-abc.vercel.app), pelo que nunca coincidem com
     | FRONTEND_URL. Definir FRONTEND_URL_PATTERN com uma expressao regular
     | delimitada permite autoriza-los sem abrir a API a qualquer origem.
     |
     | Exemplo: FRONTEND_URL_PATTERN='#^https://casagest-[a-z0-9-]+\.vercel\.app$#'
     |
     | Sem FRONTEND_URL_PATTERN, aceitam-se por omissao os deploys da equipa
     | caculo-tech (ex.: casagest-git-main-caculo-tech.vercel.app).
     */
    'allowed_origins_patterns' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env(
            'FRONTEND_URL_PATTERN',
            '#^https://casagest-[a-z0-9-]+-caculo-tech\.vercel\.app$#'
        ))
    ))),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Obrigatorio para a autenticacao por cookie do Sanctum. Se a aplicacao
    // usar apenas tokens Bearer, manter true nao tem efeito negativo.
    'supports_credentials' => true,

];
