import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const Traefik = new App({
  name: 'traefik',
  category: 'other',
  image: 'traefik:faisselle',
  traefik: false,
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
  ],
});

export default Traefik;
