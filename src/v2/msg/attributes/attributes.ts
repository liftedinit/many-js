import { Response } from "../response"

export class Attributes {
  private attributes
  constructor(attrs: unknown[]) {
    this.attributes = attrs
  }
  getAttributes() {
    return this.attributes
  }
  static getFromMessage(m: Response): Attributes | undefined {
    const attrs = m.content.get(8)
    if (Array.isArray(attrs)) return new Attributes(attrs)
    return undefined
  }
}
