FROM php:8.2-apache

# Install required packages
RUN apt-get update && apt-get install -y \
    git curl unzip zip libzip-dev \
    && docker-php-ext-install pdo pdo_mysql

# Enable Apache rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy only composer files first (to cache dependencies during builds)
COPY composer.json composer.lock* ./

# Install PHP dependencies (creates vendor/)
RUN composer install --no-dev --optimize-autoloader

# Copy the rest of the app files
COPY . .

# Expose port
EXPOSE 80
