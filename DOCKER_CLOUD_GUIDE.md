# 🚀 Docker Completo en la Nube

## Configuración Multi-Contenedor para Producción

Esta guía explica cómo desplegar backend + frontend + base de datos todo en Docker.

## 🏗️ Arquitectura Recomendada

```
Internet ──► Nginx (80/443) ──► Frontend (8080) ──► Backend (4000) ──► PostgreSQL (5432)
                              └─► API Routes (/api/*)
```

## 📋 Opciones de Plataforma

### 🥇 **1. Railway (Más Fácil) - $15-30/mes**

#### ✅ Por qué Railway es perfecto para ti:
- GitHub integrado automático
- Variables de entorno súper fáciles
- SSL automático
- Logs en tiempo real
- Zero configuración de servidores

#### 🚀 Pasos para Railway:
```bash
# 1. Ve a railway.app y conecta tu GitHub
# 2. Importa tu repositorio
# 3. Railway detecta automáticamente los Dockerfiles
# 4. Configura estas variables de entorno:

DATABASE_URL=postgresql://...  # Railway te da una automáticamente
JWT_SECRET=tu_secret_super_seguro
FRONTEND_URL=https://tu-app.railway.app
BACKEND_URL=https://tu-backend.railway.app
```

### 🥈 **2. DigitalOcean App Platform - $12-24/mes**

#### ✅ Ventajas:
- Precio predecible
- Muy buena documentación  
- Fácil de usar

#### 🚀 Configuración DigitalOcean:
```yaml
# Crear archivo .do/app.yaml en la raíz
name: inventory-app
services:
- name: backend
  source_dir: /backend
  dockerfile_path: backend/Dockerfile.cloud
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    value: tu_secret_aqui

- name: frontend  
  source_dir: /frontend
  dockerfile_path: frontend/Dockerfile
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_API_URL
    value: ${backend.PUBLIC_URL}

databases:
- name: postgres
  engine: PG
  version: "15"
  size: basic-xs
```

### 🥉 **3. Google Cloud Run - $10-20/mes**

#### ✅ Ventajas:
- Serverless (pago por uso)
- Escala automáticamente a 0
- Muy económico para tráfico bajo

#### 🚀 Configuración Google Cloud:
```bash
# 1. Habilitar Cloud Run y Cloud SQL
gcloud services enable run.googleapis.com sqladmin.googleapis.com

# 2. Crear base de datos
gcloud sql instances create postgres-instance --database-version=POSTGRES_15

# 3. Crear base de datos
gcloud sql databases create inventory_db --instance=postgres-instance

# 4. Desplegar backend
gcloud run deploy backend --source backend --allow-unauthenticated

# 5. Desplegar frontend  
gcloud run deploy frontend --source frontend --allow-unauthenticated
```

### 🎯 **4. AWS ECS Fargate - $20-50/mes**

#### ✅ Ventajas:
- Infinitamente escalable
- Sin servidores que manejar
- Integración total con AWS

#### 🚀 Configuración AWS:
```bash
# 1. Crear cluster ECS
aws ecs create-cluster --cluster-name inventory-cluster

# 2. Crear task definitions (uno por servicio)
# 3. Crear services 
# 4. Configurar Load Balancer
```

## 🛠️ Configuración Paso a Paso

### 1. Preparar archivos necesarios

Ya tienes estos archivos creados:
- `docker-compose.production.yml` - Configuración completa
- `nginx/nginx.conf` - Reverse proxy
- `.env.production.example` - Variables de entorno

### 2. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.production.example .env.production

# Edita con tus valores reales
nano .env.production
```

### 3. Probar localmente

```bash
# Desde el backend
npm run docker:production:build

# Ver logs
npm run docker:production:logs

# Parar todo
npm run docker:production:stop
```

## 🔐 Seguridad en Producción

### Variables de entorno críticas:
```bash
# Genera un JWT secret fuerte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cambia la password de PostgreSQL
# Usa HTTPS siempre
# Configura CORS correctamente
```

## 📊 Comparación de Costos

| Plataforma | Costo/mes | Facilidad | Escalabilidad |
|------------|-----------|-----------|---------------|
| Railway    | $15-30    | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐        |
| DigitalOcean| $12-24   | ⭐⭐⭐⭐      | ⭐⭐⭐         |
| Google Cloud| $10-20   | ⭐⭐⭐       | ⭐⭐⭐⭐⭐       |
| AWS        | $20-50    | ⭐⭐        | ⭐⭐⭐⭐⭐       |

## 🚀 Recomendación Final

**Para tu proyecto, recomiendo Railway** porque:

1. ✅ **Súper fácil**: Conectas GitHub y listo
2. ✅ **Precio justo**: ~$20/mes para empezar
3. ✅ **Zero configuración**: Detecta Docker automáticamente
4. ✅ **SSL gratis**: HTTPS automático
5. ✅ **Escalable**: Cuando crezcas, puedes migrar

### Pasos para Railway:
1. Ve a [railway.app](https://railway.app)
2. Conecta tu GitHub
3. Importa tu repositorio
4. Railway detecta automáticamente los 3 servicios
5. Configura las variables de entorno
6. ¡Deploy automático!

## 🔧 Troubleshooting

### Error: "Can't connect to database"
```bash
# Verificar que la DATABASE_URL sea correcta
# En Railway: Variables → DATABASE_URL
```

### Error: "CORS issues"  
```bash
# Verificar FRONTEND_URL y BACKEND_URL
# Deben coincidir con los dominios reales
```

### Error: "503 Service Unavailable"
```bash
# Verificar que todos los servicios estén corriendo
# Ver logs: railway logs --service backend
```

¿Te gustaría que configure Railway específicamente para tu proyecto?
