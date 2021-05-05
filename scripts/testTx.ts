// Script to get the block at the number provided in through the CLI,
// A very basic script to test the web3 api to substrate.

const Web3 = require('web3');
import Common from 'ethereumjs-common';
const EthereumTx = require('ethereumjs-tx');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9933'));


// Genesis account taken from the chain_spec implementation for evm config
// const GENESIS_ACCOUNT = "0x19e7e376e7c213b7e7e7e46cc70a5dd086daff2a";

const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_BALANCE = "340282366920938463463374607431768211455";
const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";

var privateKey = Buffer.from('99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342', 'hex');

const customCommon = Common.forCustomChain('mainnet', { name: 'anon', chainId: 42, networkId: 1 }, 'istanbul');
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
  chainId: '0x2A',
};

async function main() {
  const balance = await web3.eth.getBalance(GENESIS_ACCOUNT);
  console.log(`Balance: ${balance}`);

  
  var tx = new EthereumTx.Transaction(rawTx, customCommon);
  tx.sign(privateKey);
  console.log(tx);
  const serializedTx = tx.serialize();
  await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
}

main()
