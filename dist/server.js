var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export function send(url, message, keys = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const cbor = encode(message, keys);
        const reply = yield sendEncoded(url, cbor);
        // @TODO: Verify response
        return decode(reply);
    });
}
export function connect(url) {
    return {
        endpoints: () => send(url, { method: "endpoints" }),
        ledger_info: () => send(url, { method: "ledger.info" }),
        ledger_balance: (symbols, keys) => send(url, { method: "ledger.balance", data: new Map([[1, symbols]]) }, keys),
    };
}
