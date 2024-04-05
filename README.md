<img src="https://github.com/ual-cci/checkout/raw/main/_assets/icon.png" height="150px" />

# Checkout

Checkout is software for tracking assets within a Higher Education environment. Originally created for use within the Creative Technology Lab at London College of Communication, it is now maintained at UAL Creative Computing Institute.

Checkout is built on Node.js with Express, PostegreSQL via Knex.js and label printing using PDFKit into CUPS via IPP. Tasks are queued using BullMQ and Redis.

# Running it

You can run Checkout standalone or with Docker, which is probably better for production.

## Standalone

Quick steps to install Checkout standalone for production or development:

1. Copy `.env.example` to `.env` and populate with your preferences.
2. Install Postgres and Redis.
3. Install dependencies: `npm i`
4. Create a local database called checkout in the postgres terminal `create database checkout;`
5. Run Knex migrations to create database structure: `npm run db:migrate`
6. Run Knex seed to create a dummy user, and data structure: `npm run db:seed`
7. Launch Checkout with `npm run start` for production or `npm run dev` for development.
8. Navigate to `localhost:8080` (you can change the default port by editing the .env file)

Optionally, for production, you can install pm2: `npm install -g pm2` then use it to run Checkout `pm2-runtime ecosystem.config.js`

## Docker

Docker is pretty straight-forward also:

1. Install Docker + docker-compose
2. Copy `docker.env.example` to `docker.env` and populate with your preferences.
3. Run `docker-compose up`, add `-d` for headerless operation

`docker-compose down` will stop it.

You can hop into the CLI using `docker exec -it checkout_web_1 sh` if you need to, for example, run `npm run db:seed` to create an initial set of data and a dummy login user. You'll probably also need to install dev dependencies using `npm i -- dev`.

## Backups

You can back up inside Docker using `docker exec pg-dump checkout > backup.psql` with the appropriate commands. You may also want to ensure the BullMQ queue is empty, or back it up.

# DB

The database is Postgres and it uses Knex.js for its migrations and subsequent ORM. There are 2
little helper aliases:

- `npm run db:migrate` Runs the current migrations (run automatically in docker)
- `npm run db:seed` Seeds the database with basic data to allow the first login.
- `npm run db:rollback` Rolls back the latest batch of migrations

# Hardware

## Server

Checkout can run on almost any machine; however, it's recommended to run it in Docker on an Ubuntu Server, which can be almost any spec. An Intel NUC works well for this purpose, or a virtual machine.

## Scanners

You will need a 2D barcode scanner that emulates keyboard input to use Checkout. There are 3 models we've tested and recommend. All of them are older models cheaply available on eBay 2nd hand. Note that Zebra was previously owned by Motorola and previous to that Symbol, so you will find these brands used interchangeably with the same model numbers:

1. [Zebra DS2208]([https://www.zebra.com/gb/en/products/scanners/general-purpose-handheld-scanners/ds2200-series.html]\(https://www.zebra.com/gb/en/products/scanners/general-purpose-handheld-scanners/ds2200-series.html\)) - This is probably the cheapest and simplest 2D barcode scanner you'll find from a name like Zebra, but it works well.
2. [Zebra DS4208](https://www.zebra.com/gb/en/products/scanners/general-purpose-scanners/handheld/ds4208.html) - This is very similar to the DS2208, but a better product, less prone to errors, and longer distance scanning.
3. [Zebra DS6878](https://www.zebra.com/us/en/support-downloads/scanners/general-purpose-scanners/ds6878.html) - This is a cordless Bluetooth scanner with a USB base that can either be used for charging only, or as a Bluetooth receiver for the scanner to avoid needing a separate dongle.
4. [Zebra DS9208](https://www.zebra.com/gb/en/products/scanners/general-purpose-scanners/hands-free-on-counter/ds9208.html) - These do work, but they're not great for these small 2D barcodes. They might be an option for hands-free use like a kiosk. We wouldn't recommend them over a handheld scanner.

Almost all Zebra scanners use a Synapse cable, which allows you to switch the cable on the scanner for different lengths and connectors, including straight and coiled cables, USB keyboard emulation, RS232, and others.

## Label printing

Currently, Checkout can generate 9mm, 12mm, and 36mm label widths as PDFs that are submitted via IPP to a print server; this has worked well for many years, utilising a macOS print server running CUPS.

There are 4 label types in Checkout at present:
- 9mm - This is a small barcode only label for very small items, it's 9mm x 12mm but can be trimmed to 9x9mm manually.
- 12mm - This is the standard label used in Checkout it's small but includes the organsation name and text of the barcode incase the barcode won't or can't be scanned.
- 12mm_flag - This is the same as the `12mm` label but has 2 copies on one label mirrored with a central line for creating a cable flag.
- 36mm - This is currently only used for the Location feature where you can use it in the Audit feature for switching locations i.e. shelves/racks/rooms quickly.

Unfortunately, Brother discontinued their macOS driver for their printers and has never provided an up-to-date Linux driver. For now, this means you have to run an out-of-date version of macOS, but we're exploring using Windows Server and IIS or switching protocols, as IPP is not usually supported on network label printers.

Older versions of Checkout used Dymo label printers. However, we found that the tapes often didn't stick well over a long time, and the mechanism of the Dymo printer would often cut the transfer tape (destroying the cartridge) nine out of ten times before the tape got halfway through.

## Email

The system now supports SMTP emailing to people who have items on loan.

## Kiosk

Checkout is designed to be run in Kiosk mode in your office or store area. The [Elo Touch 10" I-Series 3.0 Android with Google Play Services](https://www.elotouch.com/touchscreen-computers-aaio3-10.html) touch screen and mount/stand is a great standalone kiosk device and can be bought with a 2D barcode scanner.

Important: We have found the Series 4 to be extremely slow as compared to the previous generation and cannot recommend this.

![Photo of Elo Touch 10" touch kiosk running Checkout at UAL Creative Computing Institute](https://user-images.githubusercontent.com/147143/115796677-26867780-a3ca-11eb-885a-060f25e49f1a.jpg)
