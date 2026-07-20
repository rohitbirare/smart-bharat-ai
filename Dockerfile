FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN rm -rf server
RUN npm run build

FROM node:20-alpine AS backend
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm install --production
COPY server/ .
COPY --from=frontend-build /app/dist ./public
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
