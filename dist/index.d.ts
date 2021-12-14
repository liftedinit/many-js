import * as identity from "./identity";
import * as message from "./message";
import * as server from "./server";
declare const omni: {
    identity: typeof identity;
    message: typeof message;
    server: typeof server;
};
export default omni;
