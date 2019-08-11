import { NextApiRequest, NextApiResponse } from 'next';
import { send } from 'micro';

import Apps from '@dashboard/apps';
import docker from '@dashboard/docker';

process.env.domain = 'getholo.app';

function isApp(query: string): query is keyof typeof Apps {
  return query in Apps;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    const containers = await docker.containers.list({
      filters: {
        label: 'holo.app',
      },
    });
    return send(res, 200, containers);
  }

  // Create the damn container
  if (method === 'POST') {
    const { app: query } = req.query;
    if (!query || typeof query !== 'string') {
      return send(res, 400);
    }

    if (!isApp(query)) {
      return send(res, 400);
    }

    const app = Apps[query];
    try {
      await app.create();
    } catch (err) {
      if (err instanceof Error) {
        return send(res, 400, {
          message: err.message,
        });
      }
    }

    return send(res, 200);
  }

  return send(res, 404);
}
