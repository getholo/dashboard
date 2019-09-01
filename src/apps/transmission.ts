import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const transmission = new App({
  name: 'transmission',
  category: 'download-client',
  image: 'linuxserver/transmission:latest',
  traefik: 9091,
  ports: [
    {
      src: 51413,
      dest: 51413,
      protocol: 'tcp',
    },
    {
      src: 51413,
      dest: 51413,
      protocol: 'udp',
    },
  ],
  paths: {
    config: {
      src: Variables.global.appdata,
      dest: '/config',
    },
  },
});

export default transmission;
