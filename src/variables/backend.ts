import Photon from '@generated/photon';

process.env.SQLITE_URL = 'file:./dev.db';
const photon = new Photon();

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

  async getAll() {
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
