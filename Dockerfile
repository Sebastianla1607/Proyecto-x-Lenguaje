### Dockerfile: Node server that serves `HTML/` and endpoints via `index.js`
FROM node:18-alpine
WORKDIR /app

# Install only production deps (express/cors/axios are runtime)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy the full project
COPY . .

EXPOSE 8080
CMD ["node", "index.js"]
