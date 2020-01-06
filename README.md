<img src="https://github.com/creativetechnologylab/checkout/raw/master/_assets/icon.png" height="150px" />

# Checkout
Checkout is a software system for tracking assets within a higher education environment, originally created for use within the Creative Technology Lab at London College of Communication it is now also used at the Creative Computing Institute.

Checkout is built on Node.js with Express, PostegreSQL via Knex.js and label printing using PDFKit into CUPS via IPP.

# Running it
You can run Checkout standalone or with Docker, which is probably better for production.

## Standalone
Quick steps to install Checkout standalone for production or development:

1. Copy `.env.example` to `.env` and populate with your preferences.
1. Install Postgres
1. Install dependencies: `npm i`
1. Run Knex migrations to create database structure: `npm run db:migrate`
1. Run Knex seed to create a dummy user, and data structure: `npm run db:seed`
1. Launch Checkout with `npm run start` for production or `npm run dev` for development.
1. Navigate to `localhost:3000`

Optionally for production you can install pm2: `npm install -g pm2` then use it to run Checkout `pm2-runtime ecosystem.config.js`

## Docker
Docker is pretty straight-forward also:

1. Install Docker + docker-compose
1. Copy `docker.env.example` to `docker.env` and populate with your preferences.
1. Run `docker-compose up`, add `-d` for headerless operation

`docker-compose down` will stop it.

You can hop into the CLI using `docker exec -it checkout_web_1 sh` if you need to.

# DB
The database is Postgres and it uses Knex.js for its migrations and subsequent ORM. There are 2
little helper aliases:

- `npm run db:migrate` Runs the current migrations
- `npm run db:seed` Seeds the database with basic data to allow first login.
- `npm run db:rollback` Rolls back the latest batch of migrations
