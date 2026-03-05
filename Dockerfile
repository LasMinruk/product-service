FROM node:18-alpine

LABEL maintainer="LasMinruk"
LABEL service="product-service"
LABEL version="1.0.0"

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3002

USER node

CMD ["node", "server.js"]