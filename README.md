<img src="https://github.com/ual-cci/checkout/raw/main/_assets/icon.png" height="150px" />

# Checkout
Checkout is a software system for tracking assets within a higher education environment, originally created for use within the Creative Technology Lab at London College of Communication it is now maintained at [UAL Creative Computing Institute](https://arts.ac.uk/cci).

Checkout is built on Node.js with Express, PostegreSQL via Knex.js and label printing using PDFKit into CUPS via IPP.

# Running it
You can run Checkout standalone or with Docker, which is probably better for production.

## Standalone
Quick steps to install Checkout standalone for production or development:

1. Copy `.env.example` to `.env` and populate with your preferences.
1. Install Postgres (NB -- the default homebrew install wasn't working on my M1 Mac. Instead, I used the Postgres app + double clicked the db icon to open a terminal)
1. Install dependencies: `npm i`
1. Create a local database called checkout in the postgres terminal `create database checkout;`
1. Run Knex migrations to create database structure: `npm run db:migrate`
1. Run Knex seed to create a dummy user, and data structure: `npm run db:seed`
1. Launch Checkout with `npm run start` for production or `npm run dev` for development.
1. Navigate to `localhost:8080` (you can change the default port by editing the .env file)

Optionally for production you can install pm2: `npm install -g pm2` then use it to run Checkout `pm2-runtime ecosystem.config.js`

## Docker
Docker is pretty straight-forward also:

1. Install Docker + docker-compose
1. Copy `docker.env.example` to `docker.env` and populate with your preferences.
1. Run `docker-compose up`, add `-d` for headerless operation

`docker-compose down` will stop it.

You can hop into the CLI using `docker exec -it checkout_web_1 sh` if you need to, for example to run `npm run db:seed` to create an initial set of data and a dummy login user.

## Backups
You can backup inside Docker using `docker exec pg-dump checkout > backup.psql` with the approriate commands.

# DB
The database is Postgres and it uses Knex.js for its migrations and subsequent ORM. There are 2
little helper aliases:

- `npm run db:migrate` Runs the current migrations (run automatically in docker)
- `npm run db:seed` Seeds the database with basic data to allow first login.
- `npm run db:rollback` Rolls back the latest batch of migrations

# Hardware

## Server
Checkout is able to run on almost any machine, however it's recommended to run it in Docker on an Ubuntu Server which can be almost any spec, an Intel NUC works well for this purpose, or a virtual machine.

## Scanners
You will need a 2D barcode scanner that emulates keyboard input to use Checkout. There are 3 models we've tested and recommend, all of them are older models cheaply available on eBay 2nd hand, note that Zebra, was previously owned by Motorola, and previous to that Symbol, so you will find these brands used interchangably with the same model numbers:

1. [Zebra DS4208](DS4208-SR](https://www.zebra.com/gb/en/products/scanners/general-purpose-scanners/handheld/ds4208.html) - This is a great option for a USB hand-held option.
2. [Zebra DS9208](https://www.zebra.com/gb/en/products/scanners/general-purpose-scanners/hands-free-on-counter/ds9208.html) - This is a great option for a USB hands-free option such as a kiosk location.
3. [Zebra DS6878](https://www.zebra.com/us/en/support-downloads/scanners/general-purpose-scanners/ds6878-sr.html) – This is a great option for a wireless hand-held option.

Almost all Zebra scanners use what is known as a Synapse cable, which allows you to switch the cable on the scanner for different lengths and connectors, including straight, coiled cable, USB keyboard emulation, RS232, and others.

## Label printing
Older versions of Checkout made use of Dymo label printers however, we found that the the tapes often didn't stick well over a long time and the mechanism of the Dymo printer would often cut the transfer tape (destroying the cartridge) 9 in 10 times before the tape got to half way through.

We now use Brother label printers, this option required a Mac to print, as Windows doesn't support IPP, and the Linux drivers provided by Brother are very out of date and won't print at full quality, resulting in non-scanning barcodes.

To use the printing feature at present you will need a Mac with the most recent version of macOS supported by your printer, unfortunately Brother also decided to stop developing drivers for newer macOS versions, and while the feature works, we will need to redevelop this feature in future.

## Email 
The system now supports SMTP emailing to people who have items on loan.

## Kiosk
Checkout is designed to be run in Kiosk mode in your office or store area, the [Elo Touch 10" I-Series 3.0 Android with Google Play Services](https://www.elotouch.com/touchscreen-computers-aaio3-10.html) touch screen and mount/stand is a great standalone kiosk device and can be bought with a 2D barcode scanner.

![Photo of Elo Touch 10" touch kiosk running Checkout at UAL Creative Computing Institute](https://user-images.githubusercontent.com/147143/115796677-26867780-a3ca-11eb-885a-060f25e49f1a.jpg)
