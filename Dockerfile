# Multi-stage build: build the Vite app with Node, serve with nginx
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
RUN npm install --silent

# Copy source and build
COPY . .

# Accept build-time arguments for environment variables
ARG VITE_API_BASE_URL=http://137.184.251.141:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:stable-alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
