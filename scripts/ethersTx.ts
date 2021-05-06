// Script to get the block at the number provided in through the CLI,
// A very basic script to test the web3 api to substrate.
import { ethers } from "ethers";
import Common from 'ethereumjs-common';
const EthereumTx = require('ethereumjs-tx');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:9933');

const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_BALANCE = "340282366920938463463374607431768211455";
const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";

var privateKey = Buffer.from('99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342', 'hex');

var wallet = new ethers.Wallet(privateKey, provider);

const common = Common.forCustomChain('mainnet', {
  name: 'anon',
  networkId: 42,
  chainId: 42
}, 'istanbul');

var rawTx = {
  nonce: '0x00',
  gasPrice: "0x01",
  gas: "0x100000",
  gasLimit: '0x2710',
  to: '0x0000000000000000000000000000000000000000',
  value: '0x200',
  // chainId: 42,
};

async function main() {
  const balance = await wallet.getBalance();
  console.log(`Balance: ${balance}`);
  
  var tx = new EthereumTx.Transaction(rawTx, { common });
  tx.sign(privateKey);
  console.log(tx);
  const serializedTx = tx.serialize();
  const { hash } = await provider.sendTransaction('0x' + serializedTx.toString('hex'));
  console.log(hash);
  await provider.waitForTransaction(hash);
  // await provider.sendSignedTransaction('0x' + serializedTx.toString('hex'))
}

main()
