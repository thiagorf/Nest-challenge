# Nest challenge

## Requirements

### Required Requirement:

Build a finances app that exposes endpoints to retrieve all finances (income, and expense),
and all basic CRUD operations,

### Optional Requirements:

All finances endpoints should only be accessible for authenticated users

Create a docker container for the entire application.

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

Build the docker container

```
yarn docker:dev
```

you can test the app on localhost:8000 now

> Nest dont support pre-post script hooks (as far i know), so after you are done with `yarn docker:dev`, exit the process (ctrl + c) and run `yarn container:stop`

<br>

### locally:

> Need node 16, postgres and redis installed

Install dependencies

```
yarn or npm install
```

run prisma migration

```
yarn prisma migrate dev // yarn docker:migrate
```

Run the app

```
yarn start:dev
```

## Swagger file

check localhost:8000/api

## Test (WIP)

My test methodology uses unit tests in core business rules and mocking the database and other dependencies calls, integration tests on almost everything, and the same goes for end-to-end tests.

unit test: `yarn test:watch`

integration test: `yarn test:int`

end to end test: `yarn test:end`

## Test Coverage

> needs Docker

run `yarn spec:cov`

just missing the end-to-end tests to get the coverage of the funcs

![coverage](./docs/coverage.png)
