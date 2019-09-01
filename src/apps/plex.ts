import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const plex = new App({
  name: 'plex',
  category: 'media-server',
  image: 'plexinc/pms-docker:latest',
  traefik: 32400,
  paths: {
    config: {
      src: Variables.global.appdata,
      dest: '/config',
    },
  },
});

export default plex;
