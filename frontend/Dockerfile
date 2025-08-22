# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Agregar ARG para variables de entorno de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine AS production

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001

# Cambiar permisos
RUN chown -R frontend:nodejs /usr/share/nginx/html && \
    chown -R frontend:nodejs /var/cache/nginx && \
    chown -R frontend:nodejs /var/log/nginx && \
    chown -R frontend:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R frontend:nodejs /var/run/nginx.pid

# Cambiar a usuario no-root
USER frontend

# Exponer puerto
EXPOSE 8080

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]