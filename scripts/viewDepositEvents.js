const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);

const contractAddress = process.argv[2];

const anchorAbi = require("../build/contracts/Anchor.json");

// Get all emitted event information about deposits
async function readDeposits() {

  const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
  const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

  const depositFilterResult = await anchorInstance.filters.Deposit();

  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: 'latest',
    address: contractAddress,
    topics: [depositFilterResult.topics]
  });

  for (var i=0; i<logs.length; i++)
  {
    console.log(anchorInterface.parseLog(logs[i]));
  }
  
}

readDeposits();
