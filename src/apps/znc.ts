import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const znc = new App({
  name: 'znc',
  category: 'other',
  image: 'linuxserver/znc',
  traefik: 6501,
  ports: [
    {
      src: 6501,
      dest: 6501,
    },
  ],
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
});

export default znc;
