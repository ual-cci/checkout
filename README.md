# Checkout
Checkout is a bespoke software system for managing items within the Creative Technology Lab.

# .env
The `.env` file will not be present on fresh clone of this repo, but a .env.example will be.
Please copy this file and rename it to be .env. The example file will have all of the keys that
need to be provided for your local copy, and subsequently for the deployed version.

# DB
The database is Postgres and it uses knex.js for its migrations and subsequent ORM. There are 2
little helper aliases:

- `npm run db:migrate` Runs the current migrations
- `npm run db:rollback` Rolls back the latest batch of migrations
