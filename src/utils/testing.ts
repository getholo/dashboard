import execa from 'execa';
import nanoid from 'nanoid';
import { join } from 'upath';
import fs from 'fs-extra';
import { homedir } from 'os';

const testruns = join(homedir(), 'getholo', 'dashboard', 'testing');

export async function prepare() {
  const path = join(testruns, `${nanoid(24)}.db`);
  process.env.SQLITE_URL = `file:${path}`;
  await execa.command('npm run up');
  return path;
}

export async function cleanup(path: string) {
  await fs.remove(path);
}
