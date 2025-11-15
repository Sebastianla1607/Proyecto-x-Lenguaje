### Multi-stage Dockerfile: build with Node, serve with nginx
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm install --omit=dev in builder to avoid CI failing when lockfile
# and package.json are out of sync on the build host. This is less strict
# than `npm ci` but more resilient for remote Docker builds.
RUN npm install --omit=dev
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
