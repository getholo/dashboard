# Adding Apps
Apps are the core components to Holo’s dashboard. They allow users to effortlessly build their stack by simply clicking a button.

## Creating an App
To create an app simply add a new TypeScript file to `src/apps`, and extend the `@dashboard/types/apps` class.

```ts
// src/apps/appname.ts

import App from '@dashboard/types/apps';

// Extend this with the fields mentioned in Building Blocks
const appname = new App({
  name: 'appname',
});

export default appname;
```

Also make sure to add this new file to the `src/apps/index.ts` file for Holo to recognise your app!

```ts
// src/apps/index.ts

import appname from './appname';

export default {
  appname,
};
```

## Building Blocks
Each app consists of multiple required fields, and a bunch of optional fields to further enhance integration with other apps.

### name *string*
Each app consists of a required `name` field, which specifies the name of the app. This name will be used within the API, testing suite, subdomain and certain integrations.

### category *enum*
The category field is used by certain integrations, such as the nzbdrone integration. This field allows integrations to easily filter apps to which the integration might apply.

#### content-manager
The `content-manager` category should only be used for apps which manage content, such as Sonarr and Radarr. Download clients are not allowed, nor are apps such as Ombi, as the user doesn’t actually add/remove content with these apps.

#### download-client
The `download-client` category is used for both Usenet and Torrent download clients.

#### media-server
The `media-server` category applies to apps which allow the streaming of content to mobile and web clients. Think of Plex, Jellyfin and Emby.

#### other
For all other apps, please use `other` while no other categories are available.

### image *string*
All apps are required to be Docker-compatible. When a new instance of an app is created, the API spins up a new Docker container, and thus a Docker image is required for the API to know what to deploy.

### traefik *number | false*
Does this app offer a webUI? If so, please specify the port which Traefik should use to connect. Enter `false` if you don’t want this app to be publicly available, or if the app doesn’t offer a webUI.

{% hint style="info" %}
All fields are optional from this point on.
{% endhint %}

### paths *PathMap*
Each path is identified by a unique name such as `config`, this name allows other apps, or the pre- and postInstall functions of this app, to fetch the right destination and source paths.

#### src *string*
The source path is the path which the `dest` path will mount to on your system. As containers can have unique IDs when they're being tested in the testing suite, the better option is to use `@dashboard/variables` so the path can be generated dynamically.

Recommended value: `Variables.global.appdata`

*Note: when using the appdata variable, the name of the path will be appended to the path, so you can re-use `Variables.global.appdata` for different paths.*

#### dest *string*
This is the path within the Docker container that you want to map to the `src` path.

#### readOnly *boolean*
Should this path be read-only from within the Docker container? If so, then enter `true`, otherwise `false`. Defaults to `false`.

#### Typescript definition
```ts
interface Path {
  src: string
  dest: string
  readOnly?: boolean
}

interface PathMap {
  [key: string]: Path
}
```

### Ports *Port[]*
Are there any additional ports that should be accessible from the internet? In this array you can specify all the ports which should be publicly accessible.

#### src *number*
The source of the port is the port within the Docker container.

#### dest *number*
The destination of the port of the main system.

#### protocol *enum*
The protocol to forward. Can be either `tcp` or `udp`. The default protocol is `tcp`.

#### Typescript definition
```ts
interface Port {
  src: number
  dest: number
  protocol?: 'tcp' | 'udp'
}
```

*Note: If a port is defined within the `traefik` field, this is automatically added to the Port array when Holo's dashboard is running in development mode. The traefik port is disabled in production. While the test suite is running, all port destinations will be scrambled as well.*

### commands *string[]*
If your app requires specific commands to boot, please specify them in the commands array.

### env *Env*
Some apps require certain environment variables to run correctly, you can specify these variables in here.

#### Typescript definition
```ts
interface Env {
  [key: string]: string
}
```

### functions *Functions*
Apps might offer re-usable functions for integrations and other apps to call.

#### Typescript definition
```ts
interface Functions {
  [key: string]: <T>(arg: T) => MaybePromise<any>
},
```

### variables *Variables*
*Should be used with `@dashboard/variables`*

Sometimes your app might need a permanent value store for certain secrets, or configuration parameters. In the variables field you can define a set of values you might store in a function later. The main purpose of this field is to offer a greater Developer Experience by providing auto-complete throughout the repository when variables is used in tandem with `@dashboard/variables`.

Variables are stored in a SQLite database and are powered under-the-hood by PhotonJS.
*Note: Currently only the string type is supported by `Variables.string`.*

#### Typescript example
```ts
import Variables from '@dashboard/variables';

export default {
  variables: {
    name: Variables.string,
  },
};
```

## Advanced Extensions
After initialising the building blocks within the App, you can add two functions to the app: `preInstall` and `postInstall`. These functions allow you to automatically run code both before and after an app is created.
