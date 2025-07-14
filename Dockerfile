FROM php:8.2-apache

# Install required PHP extensions
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev \
    && docker-php-ext-install pdo pdo_mysql

# Install Composer globally
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . /var/www/html

# Install Twilio SDK using Composer
RUN composer install || true \
 && composer require twilio/sdk --no-interaction