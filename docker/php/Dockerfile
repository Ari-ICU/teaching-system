FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    linux-headers \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml \
    intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# Copy composer files first for caching
COPY backend/composer.json backend/composer.lock* ./

RUN composer install --no-scripts --no-autoloader --no-interaction --ignore-platform-reqs

COPY backend .

RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
