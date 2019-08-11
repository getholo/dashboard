import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

/*
  Peer to peer networks are built on nodes, which can both be passive and active.
  A passive node (meaning, without port forwarding) will connect, download and seed
  without any problems. However, a passive node can only communicate with active nodes,
  and not with other passive nodes.
  With port forwarding enabled, you become an active node. This allows you to connect
  to both passive and active nodes, massively increading the number of peers.
*/

const Deluge = new App({
  name: 'deluge',
  category: 'download-client',
  image: 'linuxserver/deluge:latest',
  traefik: 8112,
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
});

export default Deluge;
