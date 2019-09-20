import { cleanup } from '@dashboard/utils/testing';
import app from '@dashboard/apps/deluge';

// 15 minutes
jest.setTimeout(15 * 60 * 1000);
afterAll(async (done) => {
  await cleanup();
  done();
});

describe('Apps: Deluge', () => {
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
