# AuraData
Signature based key value store

This server exposes a rest api to store and retrieve data related to an Aura or Ethereum address.  The data must be signed by the address owner.

## Pre-reqs
[NodeJS](https://nodejs.org/en/)
Tested with version 8.0.0+, YMMV with earlier versions

## Install
```
git clone https://github.com/Aura/AuraData.git
cd AuraData
npm install
```

## Development server

Create a `src/config.json` file (use `src/config.sample.json` as a template).

Start a mongo db instance in another terminal by running `startdb.sh`.

Run `npm run dist && npm start` for a dev server. This runs at `http://localhost:8997/`.

Run `npm run debug` for debugging, and add breakpoints by navigating to `chrome://inspect` and selecting your remote target
