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

# SPA fallback: redirect all routes to index.html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
