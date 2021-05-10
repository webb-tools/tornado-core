const ethers = require("ethers");
const nativeAnchorAbi = require('../build/contracts/NativeAnchor.json');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const privateKey = "0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e";

const wallet = new ethers.Wallet(privateKey, provider);

async function getMerkleRoot() {

    // This address should be the same if first transactions made from account[0] on
    // `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
    const nativeAnchorInstance = new ethers.Contract("0xfbd61c9961e0bf872b5ec041b718c0b2a106ce9d", nativeAnchorAbi.abi, wallet);

    const result = await nativeAnchorInstance.getLastRoot();
    console.log(result);
}

getMerkleRoot();
