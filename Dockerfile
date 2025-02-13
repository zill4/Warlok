FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory to root of monorepo
WORKDIR /app

FROM base AS builder
# Copy root package.json and lockfile
COPY package.json package-lock.json* ./
# Copy the frontend project and packages
COPY apps/frontend/ apps/frontend/
COPY packages/ packages/
# Copy turbo config
COPY turbo.json ./

# Install dependencies
RUN npm install

# Build the project
RUN npm run build -w apps/frontend

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 