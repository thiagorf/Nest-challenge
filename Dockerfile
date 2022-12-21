# OpenSSL fix
# FROM node:16-alpine3.16 OR
# RUN apk add --update --no-cache openssl1.1-compat

FROM node:16-alpine3.16

WORKDIR /usr/app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .


EXPOSE 8000

CMD ["npm", "run", "start:dev"]