# OpenSSL fix
# FROM node:16-alpine3.16 OR
# RUN apk add --update --no-cache openssl1.1-compat

FROM node:16-alpine3.16 as dev

WORKDIR /usr/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

FROM node:16-alpine3.16 as build

WORKDIR /usr/app

COPY  package*.json ./

COPY  --from=dev /usr/app/node_modules ./node_modules

COPY  . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

FROM node:16-alpine3.16 as prod


COPY  --from=build /usr/app/node_modules ./node_modules
COPY  --from=build /usr/app/dist ./dist




