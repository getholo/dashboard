import Photon from '@generated/photon';
import { ensureFile } from 'fs-extra';
import { join } from 'path';
import { homedir } from 'os';
import execa from 'execa';
import nanoid from 'nanoid';

const isTesting = process.env.NODE_ENV === 'test';
const testruns = join(homedir(), '.getholo', 'dashboard', 'testing');

const path = isTesting ? join(testruns, `${nanoid(24)}.db`) : join(homedir(), '.getholo', 'dashboard', 'prod.db');
process.env.SQLITE_PATH = path;
process.env.SQLITE_URL = `file:${path}`;
export const photon = new Photon();

let migrated = false;
async function migrate() {
  await ensureFile(path);
  await execa.command('npm run up');
  migrated = true;
}

export async function getVariable(name: string, app: string) {
  if (!migrated) await migrate();
  try {
    const index = `${app}-${name}`;
    const { value: variable } = await photon.variables.findOne({
      where: {
        index,
      },
    });
    return variable;
  } catch {
    return undefined;
  }
}

export default class VariablesDataSource<
  appName extends string,
  Vars extends { [key: string]: string }
> {
  constructor(private app: appName, private variables: Vars) {
    // empty innit?
  }

  async set<Var extends string & keyof Vars>(
    name: Var, // name of the variable
    value: Vars[Var], // value of the variable
  ) {
    if (!migrated) await migrate();
    const { app } = this;
    const index = `${app}-${name}`;
    const { value: variable } = await photon.variables.upsert({
      where: {
        index,
      },
      update: {
        value,
      },
      create: {
        app,
        index,
        name,
        value,
      },
    });

    return variable;
  }

  async get<Var extends string & keyof Vars>(
    name: Var, // name of the variable
  ) {
    const { app } = this;
    return getVariable(name, app);
  }

  async clear<Var extends string & keyof Vars>(
    name: Var,
  ) {
    if (!migrated) await migrate();
    const { app } = this;
    try {
      const index = `${app}-${name}`;
      const { value: variable } = await photon.variables.delete({
        where: {
          index,
        },
      });
      return variable;
    } catch {
      return undefined;
    }
  }

  async getAll() {
    if (!migrated) await migrate();
    const { app } = this;
    const variablesArray = await photon.variables.findMany({
      where: {
        app,
      },
    });

    return variablesArray.reduce(
      (object, variable) => ({
        ...object,
        [variable.name]: variable.value,
      }),
      {} as Vars,
    );
  }
}
