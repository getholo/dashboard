import Photon from '@generated/photon';
import { ensureFile } from 'fs-extra';
import { join } from 'path';
import { homedir } from 'os';
import execa from 'execa';

const path = join(homedir(), '.getholo', 'dashboard', 'prod.db');
process.env.SQLITE_URL = `file:${path}`;
const photon = new Photon();

let migrated = false;
async function migrate() {
  await ensureFile(path);
  await execa.command('npm run up');
  migrated = true;
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
    if (!migrated) await migrate();
    const { app } = this;
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
