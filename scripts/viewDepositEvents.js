const ethers = require('ethers');

const anchorAbi = require("../build/contracts/Anchor.json");
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const contractAddress = "0xfbd61c9961e0bf872b5ec041b718c0b2a106ce9d";

// Get all emitted event information about deposits
async function readDeposits() {

    const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
    const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

    const depositFilterResult = await anchorInstance.filters.Deposit();

    const eventsArr = await anchorInstance.queryFilter(depositFilterResult);

    for (var i=0; i<eventsArr.length; i++)
    {
        console.log(eventsArr[i].decode())
    }

    console.log(eventsArr);

    // const logs = await provider.getLogs({
    //     fromBlock: 0,
    //     toBlock: 'latest',
    //     address: contractAddress,
    //     topics: [depositFilterResult.topics]
    // });

    // for (var i=0; i<logs.length; i++)
    // {
    //     console.log(anchorInterface.parseLog(logs[i]));
    // }
    
}

readDeposits();
