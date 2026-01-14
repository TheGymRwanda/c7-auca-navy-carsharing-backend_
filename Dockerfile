FROM node:20-alpine

RUN apk add --no-cache postgresql-client bash

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "-v"]