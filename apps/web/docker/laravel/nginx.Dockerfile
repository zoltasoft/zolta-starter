ARG APP_PATH

FROM nginx:1.27-alpine

ARG APP_PATH
COPY docker/laravel/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY ${APP_PATH}/public /var/www/html/public

RUN rm -f /var/www/html/public/storage \
    && ln -s ../storage/app/public /var/www/html/public/storage
