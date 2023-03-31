import { Message } from "../message"
import { Base, Network } from "../network"
import { ID1, SERVERS } from "./data"

describe("Network", () => {
  const HEX = "d28440a053d92711a2036673746174757305c11a64234ee740"
  const CBOR_DATA = Buffer.from(HEX, "hex")

  let network: Network

  it("should send encoded bytes", async () => {
    network = new Network(SERVERS.LEDGER)
    const status = await network.sendEncoded(CBOR_DATA)

    expect(status).toBeDefined()
  })
  it("should send a request from bytes", async () => {
    network = new Network(SERVERS.LEDGER)
    const msg = Message.fromCborData(CBOR_DATA)
    const status = await network.send(msg)

    expect(status).toBeDefined()
  })
  it("should send a request from an object", async () => {
    network = new Network(SERVERS.LEDGER)
    const msg = Message.fromObject({ method: "status" })
    const status = await network.send(msg)

    expect(status).toBeDefined()
  })
  it("should call a method", async () => {
    network = new Network(SERVERS.LEDGER)
    network.apply([Base])
    const status = await network.call("status")

    expect(status).toBeDefined()
  })
  it("should call a method from a shortcut", async () => {
    network = new Network(SERVERS.LEDGER)
    network.apply([Base])

    const status = await network.base.status()

    expect(status).toBeDefined()
  })
  it("should call a method non-anonymously", async () => {
    network = new Network(SERVERS.LEDGER, ID1)
    network.apply([Base])

    const status = await network.base.status()

    expect(status).toBeDefined()
  })
})
