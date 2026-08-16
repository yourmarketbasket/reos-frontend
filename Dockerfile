FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund --loglevel=error

# Copy source and build
COPY . .
RUN npm run build

# Serve with nginx
FROM public.ecr.aws/docker/library/nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback + API reverse proxy to the backend
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  # Proxy all /api and /uploads traffic to the Go backend\n\
  location /api/ {\n\
    proxy_pass https://reos-api-ortox.deployments.nisoko.co.ke/api/;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host reos-api-ortox.deployments.nisoko.co.ke;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header Upgrade $http_upgrade;\n\
    proxy_set_header Connection "upgrade";\n\
    proxy_ssl_server_name on;\n\
  }\n\
\n\
  location /uploads/ {\n\
    proxy_pass https://reos-api-ortox.deployments.nisoko.co.ke/uploads/;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host reos-api-ortox.deployments.nisoko.co.ke;\n\
    proxy_ssl_server_name on;\n\
  }\n\
\n\
  # SPA fallback for all other routes\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
