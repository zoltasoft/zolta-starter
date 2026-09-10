ARG APP_PATH

FROM composer:2 AS vendor

ARG APP_PATH
WORKDIR /app

COPY ${APP_PATH}/composer.json ${APP_PATH}/composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts

FROM php:8.3-fpm-alpine

ARG APP_PATH
RUN apk add --no-cache $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install bcmath intl mbstring pdo_mysql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY ${APP_PATH} ./
COPY --from=vendor /app/vendor ./vendor
COPY docker/laravel/entrypoint.sh /usr/local/bin/zoltasoft-laravel-entrypoint

RUN chmod +x /usr/local/bin/zoltasoft-laravel-entrypoint \
    && composer dump-autoload --no-dev --optimize --no-interaction \
    && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["zoltasoft-laravel-entrypoint"]
CMD ["php-fpm"]
