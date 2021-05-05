"use strict";
// Script to get the block at the number provided in through the CLI,
// A very basic script to test the web3 api to substrate.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Web3 = require('web3');
var ethereumjs_common_1 = require("ethereumjs-common");
var EthereumTx = require('ethereumjs-tx');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9933'));
// Genesis account taken from the chain_spec implementation for evm config
// const GENESIS_ACCOUNT = "0x19e7e376e7c213b7e7e7e46cc70a5dd086daff2a";
var GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
var GENESIS_ACCOUNT_BALANCE = "340282366920938463463374607431768211455";
var GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
var privateKey = Buffer.from('99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342', 'hex');
var customCommon = ethereumjs_common_1["default"].forCustomChain('mainnet', { name: 'anon', chainId: 42, networkId: 1 }, 'istanbul');
// const anonChainParams = { name: 'anon', chainId: 42, hardforks: 'istanbul' };
// const common = new Common({ chain: 'mainnet' });
var rawTx = {
    nonce: '0x01',
    gasPrice: "0x01",
    gas: "0x100000",
    gasLimit: '0x2710',
    from: '0x6be02d1d3665660d22ff9624b7be0551ee1ac91b',
    to: '0x0000000000000000000000000000000000000000',
    value: '0x200',
    chainId: '0x2A'
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var balance, tx, serializedTx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3.eth.getBalance(GENESIS_ACCOUNT)];
                case 1:
                    balance = _a.sent();
                    console.log("Balance: " + balance);
                    tx = new EthereumTx.Transaction(rawTx, customCommon);
                    tx.sign(privateKey);
                    console.log(tx);
                    serializedTx = tx.serialize();
                    return [4 /*yield*/, web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
