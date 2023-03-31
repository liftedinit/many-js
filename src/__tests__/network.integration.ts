import { execSync } from "child_process"
import { Message } from "../message"
import { CborData } from "../message/cbor"
import { Base, Network } from "../network"
import { ID1, ID_RND, SERVERS } from "./data"

describe("Network", () => {
  let network: Network
  let HEX: string
  let CBOR_DATA: CborData

  beforeAll(() => {
    const hex = execSync("../many-rs/target/debug/many message status --hex")
    HEX = `d2${hex.toString()}`
    CBOR_DATA = Buffer.from(HEX, "hex")
  })

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
  it("should call a method with a known identity", async () => {
    network = new Network(SERVERS.LEDGER, ID1)
    network.apply([Base])

    const status = await network.base.status()

    expect(status).toBeDefined()
  })
  it("should call a method with a random identity", async () => {
    network = new Network(SERVERS.LEDGER, ID_RND())
    network.apply([Base])

    const status = await network.base.status()

    expect(status).toBeDefined()
  })
})
