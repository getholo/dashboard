import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const Sabnzbd = new App({
  name: 'sabnzbd',
  category: 'download-client',
  image: 'linuxserver/sabnzbd:latest',
  traefik: 8080,
  ports: [
    {
      src: 8080,
      dest: 9889,
    },
  ],
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
});

export default Sabnzbd;
