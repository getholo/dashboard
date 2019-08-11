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

const rutorrent = new App({
  name: 'rutorrent',
  category: 'download-client',
  image: 'linuxserver/rutorrent:latest',
  traefik: 80,
  ports: [
    {
      src: 80,
      dest: 6789,
    },
    {
      src: 5000,
      dest: 5000,
    },
    {
      src: 51413,
      dest: 51413,
    },
    {
      src: 6881,
      dest: 6881,
      protocol: 'udp',
    },
  ],
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
});

export default rutorrent;
