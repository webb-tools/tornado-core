const ethers = require("ethers");
const nativeAnchorAbi = require('../build/contracts/NativeAnchor.json');
require('dotenv').config({ path: '../.env' });

const contractAddress = process.argv[2];
let provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);

async function getMerkleRoot() {
  // This address should be the same if first transactions made from account[0] on
  // `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
  const nativeAnchorInstance = new ethers.Contract(contractAddress, nativeAnchorAbi.abi, provider);

  const result = await nativeAnchorInstance.getLastRoot();
  console.log(result);
}

getMerkleRoot();
