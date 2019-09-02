import fs from 'fs-extra';

export async function cleanup() {
  try {
    await fs.remove(process.env.SQLITE_PATH);
  } catch {
    // Apparently this can crash Travis, probably a permission based issue
  }
}
