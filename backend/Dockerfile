# Backend Dockerfile - Laravel 11 API (PHP 8.2 + Nginx / FPM)
FROM php:8.2-fpm-alpine

# Instalar dependências de sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

# Configurar extensões PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd bcmath zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar ficheiros de dependências
COPY composer.json composer.lock ./

# Instalar dependências sem autoloader otimizado para cache de layers
RUN composer install --no-scripts --no-autoloader --no-dev

# Copiar restante código da aplicação
COPY . .

# Finalizar autoload do Composer e permissões
RUN composer dump-autoload --optimize \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
