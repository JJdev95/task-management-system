FROM node:24-alpine AS build
WORKDIR /app

COPY src/TaskForge.Web/package*.json ./
RUN npm ci

COPY src/TaskForge.Web/ ./
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.29-alpine AS final
COPY src/TaskForge.Web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
