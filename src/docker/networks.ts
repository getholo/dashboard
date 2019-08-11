import axios from 'axios';

const docker = axios.create({
  socketPath: '/var/run/docker.sock',
});

interface Network {
  Name: string
  Driver: string
}

export async function create(name: string) {
  const { data: network } = await docker.request<Network>({
    method: 'POST',
    url: '/networks/create',
    data: {
      Name: name,
      Internal: false,
    },
  });

  return network;
}

export async function list() {
  const { data: networks } = await docker.request<Network[]>({
    method: 'GET',
    url: '/networks',
  });

  return networks;
}

export default {
  create,
  list,
};
