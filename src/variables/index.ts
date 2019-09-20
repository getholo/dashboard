class Globals {
  public readonly appdata = 'holo-globals-appdata' as string
  public readonly downloads = 'holo-globals-appdata' as string
  public readonly media = 'holo-globals-appdata' as string
  public readonly shared = 'holo-globals-appdata' as string
}

class Variables {
  // public readonly number: number
  public readonly string: string
  public readonly global = new Globals();
}

export const globals = new Globals();
export const variables = new Variables();
export default variables;
