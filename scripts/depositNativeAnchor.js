const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const bigInt = snarkjs.bigInt
const createDeposit = require('./createDeposit');

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
const toFixedHex = (number, length = 32) => 
  '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

if (!process.argv[2] || !ethers.utils.isAddress(process.argv[2])) {
  console.log("Contract Address required as second parameter");
  return
}

const nativeAnchorAbi = require('../build/contracts/NativeAnchor.json');

const provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
const privateKey = process.env.PRIVATE_KEY;

const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.argv[2];

async function deposit() {
  const deposit = createDeposit(rbigint(31), rbigint(31));
  const chainId = await wallet.getChainId();

  // This contract address should be the same if first transactions made from account[0] on
  // `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
  const nativeAnchorInstance = new ethers.Contract(contractAddress, nativeAnchorAbi.abi, wallet);
  const denomination = await nativeAnchorInstance.functions.denomination();

  // Value is taken from contract migration (mixer deposit denomination) and converted to base16
  await nativeAnchorInstance.deposit(toFixedHex(deposit.commitment), { value: denomination.toString() });

  // return the note of the deposit, contains secret info
  return `anchor-eth-.1-${chainId}-${toFixedHex(deposit.preimage, 62)}`
}

async function run() {
  const note = await deposit();
  console.log(note);
  return note;
}

run();
