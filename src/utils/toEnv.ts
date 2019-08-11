interface Env {
  [key: string]: any
}

export default (env: Env) => Object.entries(env).map(
  ([key, value]) => `${key}=${value}`,
);
