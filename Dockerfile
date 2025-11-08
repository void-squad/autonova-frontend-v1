# Multi-stage build: build the Vite app with Node, serve with nginx
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
RUN npm install --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
