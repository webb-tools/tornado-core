const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);

const merkleAbi = require("../build/contracts/MerkleTreeWithHistory.json");
const contractAddress = process.argv[2];

// Print out all the merkle roots
async function readRoots() {
  const merkleInstance = new ethers.Contract(contractAddress, merkleAbi.abi, provider);

  const numRoots = await merkleInstance.functions.currentRootIndex();

  console.log(numRoots);

  for(var i=0; i<=numRoots; i++)
  {
    const tmp_root = await merkleInstance.functions.roots(i);
    console.log(tmp_root);
  }
}

readRoots();
