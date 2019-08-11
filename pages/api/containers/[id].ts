import { NextApiRequest, NextApiResponse } from 'next';
import { send } from 'micro';

import Apps from '@dashboard/apps';

function isApp(query: string): query is keyof typeof Apps {
  return query in Apps;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return send(res, 400);
  }

  if (!isApp(id)) {
    return send(res, 400);
  }

  const app = Apps[id];

  if (method === 'GET') {
    const container = await app.inspect();

    if (!container) {
      return send(res, 404);
    }

    return send(res, 200, container);
  }

  if (method === 'DELETE') {
    const { force = 'true', deleteAppdata } = req.query;

    try {
      await app.remove(Boolean(force), Boolean(deleteAppdata));
      return send(res, 200);
    } catch {
      return send(res, 404);
    }
  }

  return send(res, 404);
}
