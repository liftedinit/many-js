import { Attributes } from "../attributes"
import { ResponseAttributeTypes } from "../types"

type AsyncToken = ArrayBuffer
type AsyncResponseAttribute = [number, AsyncToken]
export class AsyncAttribute {
  attribute: AsyncResponseAttribute | undefined = undefined
  constructor(attr: AsyncResponseAttribute) {
    this.attribute = attr
  }
  getAttribute() {
    return this.attribute
  }
  getToken() {
    return this.getAttribute()?.[1]
  }
  static getFromAttributes(attrs: Attributes): AsyncAttribute | undefined {
    const attr = attrs.getAttributes().find(attr => {
      if (
        Array.isArray(attr) &&
        attr[0] === ResponseAttributeTypes.async &&
        attr[1]
      ) {
        return attr
      }
    })
    return attr ? new AsyncAttribute(attr as AsyncResponseAttribute) : undefined
  }
}
