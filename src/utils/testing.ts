import fs from 'fs-extra';
import { photon } from '@dashboard/variables/backend';

export async function cleanup() {
  try {
    await photon.disconnect();
    await fs.remove(process.env.SQLITE_PATH);
  } catch {
    // Apparently this can crash Travis, probably a permission based issue
  }
}
