import { Message } from ".."

export class Attributes {
  private attributes
  constructor(attrs: unknown[]) {
    this.attributes = attrs
  }
  getAttributes() {
    return this.attributes
  }
  static getFromMessage(m: Message): Attributes | undefined {
    const attrs = m.getContent().get(8)
    if (Array.isArray(attrs)) return new Attributes(attrs)
    return undefined
  }
}
