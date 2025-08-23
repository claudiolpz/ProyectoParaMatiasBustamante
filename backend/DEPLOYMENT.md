# 🚀 Guía de Despliegue en la Nube

## Resumen
Este documento explica cómo desplegar la aplicación en diferentes plataformas cloud.

## 📋 Requisitos Previos

1. **Base de datos en la nube** (una de estas opciones):
   - PostgreSQL en Heroku
   - Supabase
   - Amazon RDS
   - Google Cloud SQL
   - Azure Database

2. **Variables de entorno configuradas**:
   - `DATABASE_URL`: URL completa de tu base de datos
   - `JWT_SECRET`: Secreto para JWT (genera uno fuerte)
   - `FRONTEND_URL`: URL de tu frontend en producción
   - `BACKEND_URL`: URL de tu backend en producción

## 🔧 Configuraciones por Plataforma

### 1. Heroku

```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Crear app
heroku create tu-app-backend

# 4. Agregar addon de PostgreSQL
heroku addons:create heroku-postgresql:mini

# 5. Configurar variables de entorno
heroku config:set JWT_SECRET=tu_secret_super_seguro
heroku config:set FRONTEND_URL=https://tu-frontend.vercel.app
heroku config:set NODE_ENV=production

# 6. Desplegar
git push heroku main
```

### 2. Vercel (Solo para APIs simples)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Configurar proyecto
vercel

# 3. Configurar variables de entorno en dashboard
# DATABASE_URL, JWT_SECRET, etc.

# 4. Desplegar
vercel --prod
```

### 3. AWS ECS/Fargate

```bash
# 1. Construir imagen
docker build -f Dockerfile.cloud -t backend-cloud .

# 2. Tag para ECR
docker tag backend-cloud:latest your-account.dkr.ecr.region.amazonaws.com/backend:latest

# 3. Push a ECR
docker push your-account.dkr.ecr.region.amazonaws.com/backend:latest

# 4. Actualizar servicio ECS
aws ecs update-service --cluster your-cluster --service backend-service --force-new-deployment
```

### 4. Google Cloud Run

```bash
# 1. Construir y subir imagen
gcloud builds submit --tag gcr.io/PROJECT-ID/backend

# 2. Desplegar
gcloud run deploy --image gcr.io/PROJECT-ID/backend --platform managed
```

### 5. Azure Container Instances

```bash
# 1. Construir imagen
docker build -f Dockerfile.cloud -t backend-cloud .

# 2. Push a Azure Container Registry
az acr build --registry myregistry --image backend:latest .

# 3. Desplegar
az container create --resource-group myResourceGroup --name backend --image myregistry.azurecr.io/backend:latest
```

## 🗄️ Migraciones de Base de Datos

### Estrategia Recomendada:

1. **Para primera vez**:
   ```bash
   # Local (para crear migraciones)
   npx prisma migrate dev --name init
   
   # Producción (para aplicar)
   npx prisma migrate deploy
   ```

2. **Para actualizaciones**:
   ```bash
   # 1. Crear migración localmente
   npx prisma migrate dev --name nueva_funcionalidad
   
   # 2. Commit y push
   git add . && git commit -m "Add migration: nueva_funcionalidad"
   
   # 3. La plataforma ejecutará automáticamente: npx prisma migrate deploy
   ```

## 🔄 Flujo de CI/CD Recomendado

### GitHub Actions (ejemplo)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Generate Prisma Client
      run: npx prisma generate
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "tu-app-backend"
        heroku_email: "tu-email@ejemplo.com"
```

## ⚠️ Consideraciones Importantes

1. **Nunca commiteques archivos .env con datos reales**
2. **Usa variables de entorno de la plataforma para secretos**
3. **Las migraciones se ejecutan automáticamente en el despliegue**
4. **Mantén respaldos regulares de tu base de datos**
5. **Usa HTTPS en producción siempre**

## 🔍 Troubleshooting

### Error común: "Can't reach database server"
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate que la base de datos acepta conexiones externas
- Verifica que las credenciales sean correctas

### Error: "Module not found @prisma/client"
- Ejecuta `npx prisma generate` antes del despliegue
- Verifica que esté en dependencies (no devDependencies)

### Error: "Port already in use"
- Usa `process.env.PORT` para el puerto
- No hardcodees el puerto 4000

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la plataforma
2. Verifica las variables de entorno
3. Confirma que las migraciones se aplicaron
4. Verifica la conectividad de la base de datos
