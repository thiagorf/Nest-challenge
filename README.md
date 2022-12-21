# Nest challenge

## Requirements

### Required Requirement:

Build a finances app that exposes endpoints to retrieve all finances (income, and expense),
and all basic CRUD operations,

### Optional Requirements:

All finances endpoints should only be accessible for authenticated users

Create a docker container for the entire application.

## Swagger file

Wip...

## Instructions

Change .example.env to .env and fill the variables

```
# If you are using docker you dont have to change the DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nest?schema=public"
# Salt round
PASSWORD_SALT=10
# Random secure string
SESSION_SECRET=
```

### With Docker:

Build the docker container and the respectively image

> only on the first installation, in the next ones you can use yarn docker

```
yarn docker:build
```

in another terminal run the prisma migration

```
yarn docker:migrate
```

you can test the app on localhost:8000 now

<br>

### locally:

> Need node 16, postgres and redis installed

Install dependencies

```
yarn or npm install
```

Change this line on main.ts (I will fix latter)

```
const redisClient = new Redis('redis://redis:6379');

 to -> const redisClient = new Redis('redis://localhost:6379');
```

run prisma migration

```
yarn prisma migrate dev // yarn docker:migrate
```

Run the app

```
yarn start:dev
```
