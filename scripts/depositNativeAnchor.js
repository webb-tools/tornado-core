const ethers = require("ethers");
require("dotenv").config();
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const circomlib = require('circomlib');
const bigInt = snarkjs.bigInt

function BNArrayToStringArray(array) {
    const arrayToPrint = [];
    array.forEach((item) => {
        arrayToPrint.push(item.toString());
    })
    return arrayToPrint;
}

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];
const toFixedHex = (number, length = 32) =>
  '0x' +
  bigInt(number)
    .toString(16)
    .padStart(length * 2, '0');

function generateDeposit() {
    let deposit = {
        secret: rbigint(31),
        nullifier: rbigint(31),
    };
    const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)]);
    const arrValues = BNArrayToStringArray(preimage);
    console.log('The preimage for the commitment: ' + arrValues);
    console.log('Nullifier: ' + toHexString(arrValues.slice(0,31)));
    console.log('Secret: ' + toHexString(arrValues.slice(31,62)));
    deposit.commitment = pedersenHash(preimage);
    console.log('The commitment: ' + deposit.commitment);
    return deposit;
}

const nativeAnchorAbi = require('../build/contracts/NativeAnchor.json');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const privateKey = "0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e";

const wallet = new ethers.Wallet(privateKey, provider);

async function run() {
    const deposit = generateDeposit();

    // This contract address should be the same if first transactions made from account[0] on
    // `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
    const nativeAnchorInstance = new ethers.Contract("0xfbd61c9961e0bf872b5ec041b718c0b2a106ce9d", nativeAnchorAbi.abi, wallet);

    // Value is taken from contract migration (mixer deposit denomination) and converted to base16
    const result = await nativeAnchorInstance.deposit(toFixedHex(deposit.commitment), { value: '0x16345785D8A0000' });
    console.log(result);
}

run()
