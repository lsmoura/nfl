# NFL JSON

Collection of JSON files related to NFL games, available on the official website.

## Requirements

This script was tested only on node version 9.

## Setting up

Just clone the repository and run `yarn` to install dependencies.

## Fetching new data

`node src <year> [<year>]`

You can pass as many years as you want, just add a space and keep typing them.

### Caching

If the environment variable `USE_REDIS` is _truthy_, it will connect to a redis server running on localhost.

You can also set `USE_REDIS=1` to a `.env` file to set this as default.
