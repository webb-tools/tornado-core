// Script to get the block at the number provided in through the CLI,
// A very basic script to test the web3 api to substrate.

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`));

var blockNumber = process.argv[2]
var output

async function getPendingBlock() {
  output = await web3.eth.getBlock(blockNumber);
  console.log(output);
}

getPendingBlock()
