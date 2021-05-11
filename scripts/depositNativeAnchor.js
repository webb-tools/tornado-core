const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const circomlib = require('circomlib');
const bigInt = snarkjs.bigInt
const stringifyBigInts = require('websnark/tools/stringifybigint').stringifyBigInts

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
    console.log('Nullifier: ' + stringifyBigInts(deposit.nullifier));
    console.log('Secret: ' + stringifyBigInts(deposit.secret));
    const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)]);
    const arrValues = BNArrayToStringArray(preimage);
    console.log('The preimage for the commitment: ' + toHexString(arrValues));
    deposit.commitment = pedersenHash(preimage);
    console.log('The commitment: ' + deposit.commitment);
    return deposit;
}

const nativeAnchorAbi = require('../build/contracts/NativeAnchor.json');
let provider, privateKey;

if (process.env.USING_GANACHE)
{
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    privateKey = process.env.PRIVATE_KEY_ETH;
}
else
{
    provider = new ethers.providers.JsonRpcProvider('http://localhost:9933');
    privateKey = process.env.PRIVATE_KEY_SUB;
}

const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.argv[2];

async function run() {
    const deposit = generateDeposit();

    // This contract address should be the same if first transactions made from account[0] on
    // `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
    const nativeAnchorInstance = new ethers.Contract(contractAddress, nativeAnchorAbi.abi, wallet);

    // Value is taken from contract migration (mixer deposit denomination) and converted to base16
    const result = await nativeAnchorInstance.deposit(toFixedHex(deposit.commitment), { value: '0x16345785D8A0000' });
    console.log(result);
}

run()
