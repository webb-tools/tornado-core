const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider;
if (process.env.USING_GANACHE)
{
  provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
}
else
{
  provider = new ethers.providers.JsonRpcProvider('http://localhost:9933');
}
const contractAddress = process.argv[2];

const anchorAbi = require("../build/contracts/Anchor.json");

// Get all emitted event information about withdrawals
async function readWithdrawals() {

  const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
  const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

  const withdrawalFilterResult = await anchorInstance.filters.Withdrawal();

  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: 'latest',
    address: contractAddress,
    topics: [withdrawalFilterResult.topics]
  });

  for (var i=0; i<logs.length; i++)
  {
    console.log(anchorInterface.parseLog(logs[i]));
  }
    
}

readWithdrawals();
