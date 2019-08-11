import { cleanup, prepare } from '@dashboard/utils/testing';
import app from '@dashboard/apps/nzbget';

// 15 minutes
jest.setTimeout(15 * 60 * 1000);
let path: string;

beforeAll(async () => {
  path = await prepare();
});

afterAll(async () => cleanup(path));

describe('Apps: Nzbget', () => {
  describe('Create App', () => {
    it('When creating app, we should not get any errors', async () => {
      // Act
      await app.create();
    });
  });

  describe('Inspect App', () => {
    it('When inspecting the image, we should get all variables', async () => {
      await app.inspect();
    });
  });

  describe('Delete App', () => {
    it('When stopping the container, we should not get any errors', async () => {
      await app.stop();
    });

    it('When removing the app, we should not get any errors', async () => {
      await app.remove(false, true);
    });
  });
});
