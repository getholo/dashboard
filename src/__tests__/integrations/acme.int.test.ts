import { cleanup, prepare } from '@dashboard/utils/testing';
import acme from '@dashboard/apps/acmedns';
import traefik from '@dashboard/apps/traefik';

import nanoid from 'nanoid/generate';

// 15 minutes
jest.setTimeout(15 * 60 * 1000);
process.env.integration = `acme-${nanoid('0123456789abcdefghijklmnopqrstuvwxyz', 20)}`;
let path: string;

beforeAll(async () => {
  path = await prepare();
});

afterAll(async () => cleanup(path));

describe('Integrations: ACME', () => {
  it('When creating ACME-DNS, we should not get any errors', async () => {
    await acme.variables.set('domain', 'test.com');
    await acme.create();
  });

  it('When running the postInstall of ACME-DNS, we should not get any errors', async () => {
    await acme.postInstall(acme);
  });

  it('When creating Traefik, we should not get any errors', async () => {
    await traefik.create();
  });

  it('Stopping the Apps should not give any errors', async () => {
    await traefik.stop();
    await acme.stop();
  });

  it('Deleting the Apps should not give any errors', async () => {
    await traefik.remove(false, true);
    await acme.remove(false, true);
  });
});
