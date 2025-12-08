# CarSharing Backend

## Development Setup

### Prerequisites

Make sure you've Node.js installed. The recommended version is 20, but everything down to 16 should work. To verify, run `node --version` and check the output - you should see something like `v20.6.1`.

Verify that [Docker](https://www.docker.com/) is installed by running `docker --version`. If you see something like `Docker version 24.0.5`, you're good to go.

Next, install the required packages:
```bash
npm ci
```

And finally, copy the `.env.example` file to `.env` (no need to change anything).


### Setting up the database

The simplest way to start the database is to use the script provided in the [`package.json`](./package.json):

```bash
npm run db:start
```

If you see a message like "Error response form daemon: Conflict", that means the database container is already running so there's nothing to worry about.

If instead you see a message containing "port is already allocated", that means that you already have a database running. Please stop that instance and try again. 

At this point, the database server is running, but it doesn't contain any tables yet. We're using [pgmigrate](https://github.com/salsita/node-pg-migrate) to handle this. To run the migrations (which you can find in the [migrations](./migrations) directory if you want to take a look), use the following command:

```bash
npm run db:migrate-up
```

It should terminate with a "Migrations complete!" message. If you see an error message like "could not connect to progress", double-check that your database container is running and that your [`.env`](./.env) file exists and has the correct settings.

You know have all the tables you need, but they don't contain any data. More specifically, there are no users yet which means you can't log in to the application. So the next step is to load some data. We do this via plain SQL files which you can find in the [`fixture/`](./fixture) directory. The [`002-users.sql`](./fixture/002-users.sql) file is of particular interest, you can find the usernames and passwords there.

```bash
npm run db:load-fixture
```

You are now good to go!

# Starting the server

```bash
npm run start:dev
```

# Running the tests

We are using two types of tests in this project: unit test and integration tests. By convention, unit tests use `<name>.test.ts` as their naming scheme and integration tests use `<name>.integration-test.ts`.

Most integration tests run against a real database. We use [Testcontainers](https://testcontainers.com/) to automatically start one in the background, you don't need to do that yourself.

To run the tests, simply execute `npm run test:jest`.

# Debug

For VSCode you can use 2 debug configurations enabling you to debug the server and the tests. Open the "Run and Debug" section of VSCode on the left panel and choose the configuration on the top of the sidebar. The play button starts server or tests stopping on breakpoints, which you can set by clicking on the left of the line numbers.
