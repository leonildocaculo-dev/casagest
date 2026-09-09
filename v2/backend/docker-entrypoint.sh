#!/bin/sh
set -e

# O symlink public/storage esta no .gitignore e portanto nao existe na imagem.
# Sem ele os URLs /storage/... devolvem 404 e as imagens nao carregam. E
# idempotente: `--force` recria o link se ja existir.
php artisan storage:link --force || echo "AVISO: storage:link falhou"

# Limpa configuracao em cache de builds anteriores. Sem isto, variaveis de
# ambiente alteradas no painel do Render sao ignoradas em runtime.
php artisan config:clear || true

# Em vez de arrancar apenas o artisan serve, arrancamos o Supervisor
# para gerir tanto o servidor web como o WebSocket (Reverb) em simultâneo.
exec /usr/bin/supervisord -c /etc/supervisord.conf
