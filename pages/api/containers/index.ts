import { NextApiRequest, NextApiResponse } from 'next';
import { send } from 'micro';

import Apps from '@dashboard/apps';
import { listApps } from '@dashboard/utils';

function isApp(query: string): query is keyof typeof Apps {
  return query in Apps;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    const apps = await listApps();
    const instances = await Promise.all(
      apps.map(app => app.inspect()),
    );
    return send(res, 200, instances);
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

    const inspection = await app.inspect();
    if (!inspection) {
      return send(res, 400);
    }

    return send(res, 200, inspection);
  }

  return send(res, 404);
}
