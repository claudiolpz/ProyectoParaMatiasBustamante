#!/bin/bash

# Script de despliegue para la nube
# Uso: ./deploy.sh [platform] [environment]
# Ejemplos: 
#   ./deploy.sh vercel production
#   ./deploy.sh heroku staging
#   ./deploy.sh aws production

PLATFORM=${1:-docker}
ENVIRONMENT=${2:-production}

echo "🚀 Iniciando despliegue para $PLATFORM en $ENVIRONMENT"

# Verificar que existan las migraciones
if [ ! -d "prisma/migrations" ]; then
    echo "❌ Error: No se encontraron migraciones. Ejecuta 'npx prisma migrate dev --name init' primero"
    exit 1
fi

# Generar cliente Prisma
echo "📦 Generando cliente Prisma..."
npx prisma generate

case $PLATFORM in
    "heroku")
        echo "🔧 Configurando para Heroku..."
        # Heroku ejecuta las migraciones automáticamente con el comando en Procfile
        git add .
        git commit -m "Deploy to Heroku - $ENVIRONMENT"
        git push heroku main
        ;;
    
    "vercel")
        echo "🔧 Configurando para Vercel..."
        # Vercel necesita configuración especial para Prisma
        npx vercel --prod
        ;;
    
    "aws")
        echo "🔧 Configurando para AWS..."
        # Construir imagen Docker para AWS ECS/EKS
        docker build -f Dockerfile.cloud -t backend-cloud:latest .
        # Aquí irían los comandos específicos de AWS CLI
        echo "⚠️  Configura AWS CLI y empuja la imagen a ECR"
        ;;
    
    "docker")
        echo "🔧 Usando Docker Compose para producción..."
        docker-compose -f docker-compose.cloud.yml build --no-cache
        docker-compose -f docker-compose.cloud.yml up -d
        ;;
    
    *)
        echo "❌ Plataforma no soportada: $PLATFORM"
        echo "Plataformas soportadas: heroku, vercel, aws, docker"
        exit 1
        ;;
esac

echo "✅ Despliegue completado para $PLATFORM"
