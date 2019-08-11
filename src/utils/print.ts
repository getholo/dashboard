import kleur from 'kleur';
// import dayjs from 'dayjs';

const isDebug = process.env.NODE_ENV !== 'production';
const isTesting = process.env.NODE_ENV === 'test';

export function log(msg: string) {
  // const time = dayjs().format('DD-MM-YYYY HH:mm:ss');
  console.log(msg);
}

export function debug(msg: string) {
  if (isDebug) {
    console.log(`[ ${kleur.blue('debug')} ] ${msg}`);
  }
}

export function test(msg: string) {
  if (isTesting) {
    console.log(`[ ${kleur.magenta('test')} ]  ${msg}`);
  }
}

export default {
  log,
  debug,
  test,
};
