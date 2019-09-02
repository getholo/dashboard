import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

const ouroboros = new App({
  name: 'ouroboros',
  category: 'other',
  image: 'pyouroboros/ouroboros',
  traefik: false,
  paths: {
    config: {
      src: Variables.global.appdata,
      dest: '/config',
    },
    socket: {
      src: '/var/run/docker.sock',
      dest: '/var/run/docker.sock',
      readOnly: true,
    },
  },
  env: {
    SELF_UPDATE: "true",
    LABEL_ONLY: "true",
    LABEL_ENABLE: "true",
    CLEANUP: "true",
    CRON: "*/30 * * * *",
    DOCKER_SOCKET: "unix://var/run/docker.sock",
  },
});

export default ouroboros;
