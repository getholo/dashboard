import axios from 'axios';

const docker = axios.create({
  socketPath: '/var/run/docker.sock',
});

export async function pull(image: string) {
  await docker.request({
    method: 'POST',
    url: '/images/create',
    params: {
      fromImage: image,
    },
  });
}

export default {
  pull,
};
