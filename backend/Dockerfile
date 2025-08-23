FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/

# Instalar dependencias y generar cliente Prisma
RUN npm ci && \
    npx prisma generate && \
    echo "Cliente Prisma generado exitosamente"

# Copiar código fuente
COPY src/ ./src/

# Construir la aplicación
RUN npm run build && \
    echo "Verificación final del cliente Prisma:" && \
    ls -la node_modules/@prisma/client/

# Copiar el resto de archivos
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 && \
    chown -R backend:nodejs /app

# Cambiar a usuario no-root
USER backend

# Exponer puerto
EXPOSE 4000

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["npm", "start"]
