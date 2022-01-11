import * as identity from "./identity";
import * as keys from "./keys";
import * as message from "./message";
import * as server from "./server";
declare const omni: {
    identity: typeof identity;
    keys: typeof keys;
    message: typeof message;
    server: typeof server;
};
export default omni;
