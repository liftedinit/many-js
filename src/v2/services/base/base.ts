import { Server } from "../server"

import { endpoints } from "./endpoints"
import { heartbeat } from "./heartbeat"
import { status } from "./status"

export class Base extends Server {
  endpoints = () => endpoints(this)
  heartbeat = () => heartbeat(this)
  status = () => status(this)
}