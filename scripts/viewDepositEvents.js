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

// Get all emitted event information about deposits
async function readDeposits() {

    const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
    const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

    const depositFilterResult = await anchorInstance.filters.Deposit();

    // const eventsArr = await anchorInstance.queryFilter(depositFilterResult);

    // for (var i=0; i<eventsArr.length; i++)
    // {
    //     console.log(eventsArr[i].decode())
    // }

    // console.log(eventsArr);

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
