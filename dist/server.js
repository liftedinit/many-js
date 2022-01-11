var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toString } from "./identity";
import { decode, encode } from "./message";
export function sendEncoded(url, cbor) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/cbor" },
            body: cbor,
        });
        const buffer = yield response.arrayBuffer();
        return Buffer.from(buffer);
    });
}
export function send(url, message, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        const cbor = encode(message, keys);
        const reply = yield sendEncoded(url, cbor);
        // @TODO: Verify response
        return decode(reply);
    });
}
export function connect(url) {
    return {
        call: (method, args, keys) => call(url, method, args, keys),
        // Base
        endpoints: (prefix) => call(url, "endpoints", { prefix }),
        heartbeat: () => call(url, "heartbeat"),
        status: () => call(url, "status"),
        echo: (message) => call(url, "echo", message),
        // ABCI
        abciBeginBlock: () => {
            throw new Error("Not implemented");
        },
        abciCommit: () => {
            throw new Error("Not implemented");
        },
        abciEndBlock: () => {
            throw new Error("Not implemented");
        },
        abciInfo: () => {
            throw new Error("Not implemented");
        },
        abciInit: () => {
            throw new Error("Not implemented");
        },
        // Account
        accountBalance: (symbols, keys) => call(url, "account.balance", new Map([[1, symbols]]), keys),
        accountBurn: () => {
            throw new Error("Not implemented");
        },
        accountInfo: (keys) => call(url, "account.info", keys),
        accountMint: () => {
            throw new Error("Not implemented");
        },
        accountSend: (to, amount, symbol, keys) => call(url, "account.send", new Map([
            [1, toString(to)],
            [2, amount],
            [3, symbol],
        ]), keys),
        // Ledger
        ledgerInfo: () => call(url, "ledger.info"),
        ledgerList: () => {
            throw new Error("Not implemented");
        },
    };
}
function call(url, method, args, keys) {
    return send(url, { method, data: args }, keys);
}
