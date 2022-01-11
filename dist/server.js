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
        // Legacy - REMOVE when Albert is using new methods below
        ledger_info: () => call(url, "ledger.info"),
        ledger_balance: (symbols, keys) => call(url, "ledger.balance", new Map([[1, symbols]]), keys),
        // Base
        endpoints: (prefix) => call(url, "endpoints", { prefix }),
        heartbeat: () => call(url, "heartbeat"),
        status: () => call(url, "status"),
        echo: (message) => call(url, "echo", message),
        // Blockchain
        blockchainInfo: () => call(url, "blockchain.info"),
        blockchainBlockAt: (height) => call(url, "blockchain.blockAt", height),
        // Ledger
        ledgerBalance: (symbols, keys) => call(url, "ledger.balance", new Map([[1, symbols]]), keys),
        ledgerBurn: () => { },
        ledgerInfo: () => call(url, "ledger.info"),
        ledgerMint: () => { },
        ledgerSend: (to, amount, symbol, keys) => call(url, "ledger.send", new Map([
            [1, toString(to)],
            [2, amount],
            [3, symbol],
        ]), keys),
    };
}
function call(url, method, args, keys) {
    return send(url, { method, data: args }, keys);
}
