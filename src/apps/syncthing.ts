import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const syncthing = new App({
  name: 'syncthing',
  category: 'other',
  image: 'linuxserver/syncthing',
  traefik: 8384,
  ports: [
    {
      src: 22000,
      dest: 22000,
      protocol: 'tcp',
    },
    {
      src: 21027,
      dest: 21027,
      protocol: 'udp',
    },
  ],
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
      readOnly: false,
    },
  ],
});

export default syncthing;
