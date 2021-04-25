<img src="https://github.com/creativetechnologylab/checkout/raw/master/_assets/icon.png" height="150px" />

# Checkout
Checkout is a software system for tracking assets within a higher education environment, originally created for use within the Creative Technology Lab at London College of Communication it is now maintained at [UAL Creative Computing Institute](https://arts.ac.uk/cci).

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

You can hop into the CLI using `docker exec -it checkout_web_1 sh` if you need to, for example to run `npm run db:seed` to create an initial set of data and a dummy login user.

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
You may want to have mobile 2D barcode scanners for use of the audit function or for staff performing back office admin tasks, for this purpose USB Keyboard Emulation scanners are what you are looking for, the best coming from Zebra (formerly Motorola, formerly Symbol) and can be easily obtained second hand for very reasonable prices, the [DS4208-SR](https://www.zebra.com/gb/en/products/scanners/general-purpose-scanners/handheld/ds4208.html) is a great wired hand scanner for this purpose, and the [DS9208](https://www.zebra.com/gb/en/products/scanners/general-purpose-scanners/hands-free-on-counter/ds9208.html) is a great hands free option.

Most Zebra/Motorola/Symbol brand scanners have an interchangable cable which allows you to switch between different modes, a RS232 or Keyboard Wedge scanner can be converted to a USB Keyboard Emulation keyboard by purchasing the apporirate Zebra Synapse cable, additionally different options are available in various lengths and also straight or coiled cables.

## Label printing
Older versions of Checkout made use of Dymo label printers however we found that the the tapes often didn't stick well over a long time and the mechanism of the Dymo printer would often cut the transfer tape (destroying the cartridge) 9 in 10 times before the tape got to half way through.

We now use Brother label printers, you are going to need to use this printer via IPP using 12mm or 36mm black on white tape, it's planned to review this option as these printers don't natively support IPP so you have to use CUPS and the Linux support is extremely poor meaning the barcode resolution is unusable meaning you are currently limited to requiring a macOS device to print.

## Kiosk
Checkout is designed to be run in Kiosk mode in your office or store area, the [Elo Touch 10" I-Series 3.0 Android with Google Play Services](https://www.elotouch.com/touchscreen-computers-aaio3-10.html) touch screen and mount/stand is a great standalone kiosk device and can be bought with a 2D barcode scanner.

![Photo of Elo Touch 10" touch kiosk running Checkout at UAL Creative Computing Institute](https://user-images.githubusercontent.com/147143/115796677-26867780-a3ca-11eb-885a-060f25e49f1a.jpg)
