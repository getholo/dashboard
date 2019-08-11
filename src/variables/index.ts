class Globals {
  public readonly appdata = 'appdata' as string
  public readonly media = 'media' as string
}

class Variables {
  // public readonly number: number
  public readonly string: string
  public readonly global = new Globals();
}

export default new Variables();
