import { NextApiRequest, NextApiResponse } from 'next';
import { send } from 'micro';
import ip from 'public-ip';
import { promises as dns } from 'dns';

import acme from '@dashboard/apps/acmedns';
import traefik from '@dashboard/apps/traefik';

type Record = {
  active: boolean
  type: 'A' | 'CNAME' | 'NS'
  name: string
  content: string
}

async function fetchDns({ name, type, content }: Record) {
  return new Promise<boolean>(
    async (resolve) => {
      let record: string;

      setTimeout(() => {
        resolve(false);
      }, 2000);

      try {
        if (type === 'A') {
          [record] = await dns.resolve4(name);
        } else if (type === 'CNAME') {
          [record] = await dns.resolveCname(name);
        } else if (type === 'NS') {
          [record] = await dns.resolveNs(name);
          if (record === name) {
            resolve(true);
          }
        }
      } catch {
        resolve(false);
      }

      resolve(record === content);
    },
  );
}

async function getDnsRecords(domain: string, subdomain: string) {
  const records: Record[] = [
    {
      active: false,
      type: 'A',
      name: `*.${domain}`,
      content: await ip.v4({
        https: true,
      }),
    },
    {
      active: false,
      type: 'CNAME',
      name: `_acme-challenge.${domain}`,
      content: `${subdomain}.acme.${domain}`,
    },
    {
      active: false,
      type: 'NS',
      name: `acme.${domain}`,
      content: `dns.${domain}`,
    },
  ];

  const recordsWithDNS: Record[] = await Promise.all(
    records.map(
      async record => ({
        ...record,
        active: record.active || await fetchDns(record),
      }),
    ),
  );

  return recordsWithDNS;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  if (method === 'GET') {
    if (!query || !query.domain || typeof query.domain !== 'string') {
      await send(res, 400, 'Missing Domain');
      return;
    }

    const { domain, firstCall } = query;

    if (firstCall) {
      await acme.remove(true, true);
      await traefik.remove(true, false);

      await acme.variables.clear('fulldomain');
      await acme.variables.clear('password');
      await acme.variables.clear('subdomain');
      await acme.variables.clear('username');
      await acme.variables.clear('domain');
      await acme.variables.set('domain', domain);
      await acme.create();
    }

    const records = await getDnsRecords(domain, await acme.variables.get('subdomain'));

    await send(res, 200, records);
  }

  await send(res, 400);
}
