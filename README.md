<img src="https://github.com/creativetechnologylab/checkout/raw/master/_assets/icon.png" height="150px" />

# Checkout
Checkout is a software system for tracking assets within a higher education environment, originally created for use within the Creative Technology Lab at London College of Communication.

Checkout is built on Node.js with Express, PostegreSQL via Knex.js and label printing using PDFKit into CUPS via IPP.

# Running it
You can run Checkout with `npm run start` if you are developing use `npm run dev`.

# .env
The `.env` file will not be present on fresh clone of this repo, but a .env.example will be.
Please copy this file and rename it to be .env. The example file will have all of the keys that
need to be provided for your local copy, and subsequently for the deployed version.

# DB
The database is Postgres and it uses knex.js for its migrations and subsequent ORM. There are 2
little helper aliases:

- `npm run db:migrate` Runs the current migrations
- `npm run db:rollback` Rolls back the latest batch of migrations
