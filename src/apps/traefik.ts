import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

// PreInstall dependencies
import acme from '@dashboard/apps/acmedns';
import { writeFile, ensureFile } from 'fs-extra';
import { join } from 'upath';

const traefik = new App({
  name: 'traefik',
  category: 'other',
  image: 'traefik:2.0',
  traefik: 8080,
  ports: [
    {
      src: 80,
      dest: 80,
    },
    {
      src: 443,
      dest: 443,
    },
  ],
  paths: {
    config: {
      src: Variables.global.appdata,
      dest: '/etc/traefik',
    },
    certs: {
      src: Variables.global.appdata,
      dest: '/letsencrypt',
    },
    socket: {
      src: '/var/run/docker.sock',
      dest: '/var/run/docker.sock',
      readOnly: true,
    },
  },
  commands: [
    '--providers.docker=true',
    '--providers.docker.exposedbydefault=false',
    '--entryPoints.web.address=:80',
    '--entrypoints.websecure.address=:443',
    '--api.dashboard=true',
    '--certificatesresolvers.acmedns.acme.dnschallenge=true',
    '--certificatesresolvers.acmedns.acme.dnschallenge.provider=acme-dns',
    '--certificatesresolvers.acmedns.acme.storage=/letsencrypt/acme.json',
  ],
  env: {
    ACME_DNS_STORAGE_PATH: '/etc/traefik/acmedns.json',
  },
});

traefik.preInstall = async (app) => {
  const { config } = app;

  const variables = await acme.variables.getAll();
  if (!variables.domain || !variables.fulldomain) {
    throw new Error('Missing Variables');
  }

  config.env.ACME_DNS_API_BASE = `http://${acme.id}`;
  config.commands.push(`--certificatesresolvers.acmedns.acme.email=admin@${variables.domain}`);

  const path = join(traefik.paths.config.src, 'acmedns.json');
  await ensureFile(path);
  await writeFile(path, JSON.stringify({
    [variables.domain]: {
      username: variables.username,
      password: variables.password,
      fulldomain: variables.fulldomain,
      subdomain: variables.subdomain,
    },
  }, null, 2));

  return config;
};

export default traefik;
