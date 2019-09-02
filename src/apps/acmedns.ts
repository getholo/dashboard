import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';
import { randomPort } from '@dashboard/utils';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

import axios from 'axios';
import { writeFile, ensureFile } from 'fs-extra';
import { join } from 'upath';

const acmedns = new App({
  name: 'acmedns',
  category: 'other',
  image: 'joohoi/acme-dns',
  traefik: 80,
  ports: [
    {
      src: 53,
      dest: 53,
    },
    {
      src: 53,
      dest: 53,
      protocol: 'udp',
    },
    {
      src: 80,
      dest: randomPort(),
    },
  ],
  paths: {
    config: {
      src: Variables.global.appdata,
      dest: '/etc/acme-dns',
      readOnly: true,
    },
    data: {
      src: Variables.global.appdata,
      dest: '/var/lib/acme-dns',
    },
  },
  variables: {
    domain: Variables.string,
    subdomain: Variables.string,
    fulldomain: Variables.string,
    username: Variables.string,
    password: Variables.string,
  },
});

const generateConfig = (domain: string, email: string) => `
[general]
listen = ":53"
protocol = "both"
debug = false
domain = "acme.${domain}"
nsname = "acme.${domain}"
nsadmin = "${email}"
records = [
  "acme.${domain}. CNAME ${domain}.",
  "acme.${domain}. NS acme.${domain}.",
]

[database]
engine = "sqlite3"
connection = "/var/lib/acme-dns/acme-dns.db"

[api]
ip = "0.0.0.0"
disable_registration = false
port = "80"
tls = "none"
use_header = false
header_name = "X-Forwarded-For"
corsorigins = [
  "*"
]

[logconfig]
loglevel = "debug"
logtype = "stdout"
logformat = "text"
`;

acmedns.preInstall = async () => {
  const { config } = acmedns;

  const variables = await acmedns.variables.getAll();
  if (!variables.domain) {
    throw new Error('Missing Domain');
  }

  const { domain } = variables;
  const email = `admin.${domain}`;

  const path = join(acmedns.paths.config.src, 'config.cfg');
  await ensureFile(path);
  await writeFile(path, generateConfig(domain, email));

  return config;
};

interface Response {
  username: string
  password: string
  fulldomain: string
  subdomain: string
}

acmedns.postInstall = async () => {
  if (await acmedns.variables.get('fulldomain')) return;

  const { port } = await acmedns.inspect();
  await waitUntilReachable(`http://localhost:${port}`);

  const { data } = await axios.request<Response>({
    method: 'POST',
    url: `http://localhost:${port}/register`,
  });

  await acmedns.variables.set('username', data.username);
  await acmedns.variables.set('password', data.password);
  await acmedns.variables.set('fulldomain', data.fulldomain);
  await acmedns.variables.set('subdomain', data.subdomain);

  await acmedns.remove(true);
  await acmedns.create();
};

export default acmedns;
