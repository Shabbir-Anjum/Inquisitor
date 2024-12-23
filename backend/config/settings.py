"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 4.2.11.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG')

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS').split(',')


APPEND_SLASH = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'console',
    'accounts',
    'djoser',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_extensions'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
   'default': {
       'ENGINE': os.getenv('DB_ENGINE'),
       'NAME': os.getenv('DB_NAME'),
       'HOST': os.getenv('DB_HOST'),
       'USER': os.getenv('DB_USER'),
       'PASSWORD': os.getenv('DB_PASSWORD')
   }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = 'api/static/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = 'api/media/'


# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ORIGIN_ALLOW_ALL = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # 'DEFAULT_PERMISSION_CLASSES': (
    #         'rest_framework.permissions.IsAuthenticated',
    # ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}

DJOSER = {
    "USER_CREATE_PASSWORD_RETYPE" : True,
    "SEND_ACTIVATION_EMAIL" : True,
    "SEND_CONFIRMATION_EMAIL" : False,
    "SET_PASSWORD_RETYPE" : True,
    "PASSWORD_RESET_CONFIRM_RETYPE" : True,
    "PASSWORD_CHANGED_EMAIL_CONFIRMATION" : False,
    "ACTIVATION_URL" : os.getenv("ACTIVATION_URL"),
    "PASSWORD_RESET_CONFIRM_URL" : os.getenv("PASSWORD_RESET_CONFIRM_URL"),
    "EMAIL_FRONTEND_PROTOCOL" : os.getenv("EMAIL_FRONTEND_PROTOCOL"),
    "EMAIL_FRONTEND_DOMAIN" : os.getenv("EMAIL_FRONTEND_DOMAIN"),
    "EMAIL_FRONTEND_SITE_NAME" : "Intervuo",
    'SERIALIZERS' : {
        'user_create' : 'djoser.serializers.UserCreateSerializer',
        'current_user' : 'djoser.serializers.UserSerializer',
        'user_delete' : 'djoser.serializers.UserDeleteSerializer',
    }
}

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ("JWT",),
    'ACCESS_TOKEN_LIFETIME' : timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True
}

FRONTEND_URL = os.getenv('frontend')
AUTH_USER_MODEL = os.getenv('AUTH_USER_MODEL')

SEND_CONFIRMATION_EMAIL=True
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = os.getenv('EMAIL_PORT')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_CONFIRMATION_EXPIRATION_TIME = os.getenv('EMAIL_CONFIRMATION_EXPIRATION_TIME')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')

CELERY_BROKER_URL=os.getenv('CELERY_BROKER_URL')


VOICE_MAP = {
    'adam': 'pNInz6obpgDQGcFmaJgB',
    'alice': 'Xb7hH8MSUJpSbSDYk0k2',
    'bill': 'pqHfZKP75CvOlQylNhV4',
    'brian': 'nPczCjzI2devNBz1zQrb',
    'callum': 'N2lVS1w4EtoT3dr4eOWO',
    'charlie': 'IKne3meq5aSn9XLyUdCD',
    'charlotte': 'XB0fDUnXU5powFXDhCwa',
    'chris': 'iP95p4xoKVk53GoZ742B',
    'daniel': 'onwK4e9ZLuTAKqWW03F9',
    'george': 'JBFqnCBsd6RMkjVDRZzb',
    'liam': 'TX3LPaxmHKxFdv7VOQHJ',
    'lily': 'pFZP5JQG7iQjIQuC4Bku',
    'matilda': 'XrExE9yKIg1WjnnlVkGX',
    'sarah': 'EXAVITQu4vr4xnSDxMaL'
}
