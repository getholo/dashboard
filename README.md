# @getholo/dashboard
Holo is an app to effortlessly launch your favourite apps in Docker containers.

- Add your own apps to Holo with **minimal configuration**.
- Holo is **cross platform**, we run on macOS, Linux, Windows and Docker!
- Easy-to-use web interface *(coming soon!)*
- REST based API

[![Build Status](https://travis-ci.org/getholo/dashboard.svg?branch=master)](https://travis-ci.org/getholo/dashboard)
[![codecov](https://codecov.io/gh/getholo/dashboard/branch/master/graph/badge.svg)](https://codecov.io/gh/getholo/dashboard)
[![Discord](https://img.shields.io/discord/480480210643451904?color=%2386E3CE&label=discord)](https://discord.gg/Su57NUH)

## We're NOT production ready yet!
Thank you for the early interest in this project!
Currently the @getholo/dashboard is still in development, and many features are still missing! To get the latest insights, please join our [Discord server](https://discord.gg/Su57NUH).

We decided to set up this repository for better internal organisation and collaboration. For anyone actually wanting to try out or contribute to this very early-access software, please contact either @PhysK or @Storm on the Holo Discord Server.

## Installation
To run Holo you'll need Git and Node.js installed on your device.
Then you can build and run Holo from your command line:
```bash
# Clone this repository
git clone https://github.com/getholo/dashboard

# Cd into the repository
cd dashboard

# Install dependencies
npm install

# Build the server
npm run build

# Start the server
npm run start
```

## API Usage
The dashboard currently offers a feature-limited API.

### Currently supported apps
The following apps will start without any issues:
- Deluge
- NZBGet
- Plex (not configured OOB)
- Radarr
- Rutorrent
- Sabnzbd
- Sonarr
- Traefik (not configured OOB)
- Transmission

Please note that **none** of these apps currently run as one would expect. The WebUIs will start but the paths aren't mapped to the main system yet. I advise you to **avoid** running Plex and Traefik at all, as they're still missing their configurations.

### Containers
The API currently allows you to perform basic CRUD operations on containers.

All requests respond with at least the following details:
```json
{
  "name": "radarr",
  "image": "linuxserver/radarr:latest",
  "internalPort": 7878,
  "port": 7878,
  "url": "http://localhost:7878",
  "env": [
    "GUID=501",
    "PUID=20"
  ],
  "labels": {
    "holo.app": "radarr",
    "traefik.enabled": "true",
    "traefik.frontend.rule": "Host:radarr.domain.tld",
    "traefik.port": "7878"
  },
}
```

#### GET /api/containers
Get a list of running containers.

#### POST /api/containers?app=name
_Replace `name` with one of Holo's supported app names._

Creates a container for one of Holo's supported apps.

#### GET /api/containers/name
_Replace `name` with the actual app name_

Get information on a currently running container.

#### DELETE /api/containers/name
_Replace `name` with the actual app name_

Forcefully removes the container.


## You may also like...
* [Cloudbox](https://github.com/Cloudbox/Cloudbox)
* [PGBlitz](https://github.com/PGBlitz/PGBlitz.com)
