const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });
const anchorAbi = require("../build/contracts/Anchor.json");

let provider;

if (process.env.USING_GANACHE) {
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
}
else {
    provider = new ethers.providers.JsonRpcProvider('http://localhost:9933');
}

module.exports = async function getDepositEvents(contractAddress) {
    // Query the blockchain for all deposits that have happened
    const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
    const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);
    const depositFilterResult = await anchorInstance.filters.Deposit();

    const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',  
        address: contractAddress,
        topics: [depositFilterResult.topics]
    });

    // Decode the logs for deposit events
    const decodedEvents = await logs.map(log => {
        return anchorInterface.parseLog(log);
    })

    return decodedEvents;
}

