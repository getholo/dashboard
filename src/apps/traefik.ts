import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const Traefik = new App({
  name: 'traefik',
  category: 'other',
  image: 'traefik:faisselle',
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
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/etc/traefik',
    },
    {
      src: '/var/run/docker.sock',
      dest: '/var/run/docker.sock',
      readOnly: true,
    },
  ],
  commands: [
    '--providers.docker=true',
    '--providers.docker.exposedbydefault=false',
    '--entryPoints.web.address=:80',
    '--entryPoints.web-secure.address=:443',
    '--api.dashboard=true',
  ],
});

export default Traefik;
