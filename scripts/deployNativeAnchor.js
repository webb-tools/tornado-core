// This script can be run without arguments to generate all new contracts or,
// the script can be run as `node deployNativeAnchor <hasherAddress> <verifierAddress>`
//    to create a mixer with existing hasher and verifier contracts.

require("dotenv").config({ path: '../.env' });
const ethers = require("ethers");
const genContract = require('circomlib/src/mimcsponge_gencontract.js');
const verifierContract = require('../build/contracts/Verifier.json');
const nativeAnchorContract = require('../build/contracts/NativeAnchor.json');

const hasherContractRaw = {
  contractName: 'Hasher',
  abi: genContract.abi,
  bytecode: genContract.createCode('mimcsponge', 220),
};

const verifierContractRaw = {
  contractName: 'Verifier',
  abi: verifierContract.abi,
  bytecode: verifierContract.bytecode,
};

const nativeAnchorContractRaw = {
  contractName: 'NativeAnchor',
  abi: nativeAnchorContract.abi,
  bytecode: nativeAnchorContract.bytecode,
};

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
async function deployNativeAnchor() {

  // If command line args are passed in, assume an attempt to deploy the mixer
  // with existing hasher and verifier contracts
  if (process.argv.length == 4)
  {
    const denomination = ethers.BigNumber.from("100000000000000000");
    const merkleTreeHeight = 20;
    const nativeAnchorFactory = new ethers.ContractFactory(nativeAnchorContractRaw.abi, nativeAnchorContractRaw.bytecode, wallet);
    let nativeAnchorInstance = await nativeAnchorFactory.deploy(process.argv[3], 
                                process.argv[2], denomination, merkleTreeHeight, {gasLimit: '0x5B8D80'});
    const nativeAnchorAddress = await nativeAnchorInstance.deployed();

    console.log(nativeAnchorAddress.address);
    return;
  }

  const hasherFactory = new ethers.ContractFactory(hasherContractRaw.abi, hasherContractRaw.bytecode, wallet);
  let hasherInstance = await hasherFactory.deploy({gasLimit: '0x5B8D80'});
  await hasherInstance.deployed();

  const verifierFactory = new ethers.ContractFactory(verifierContractRaw.abi, verifierContractRaw.bytecode, wallet);
  let verifierInstance = await verifierFactory.deploy({gasLimit: '0x5B8D80'});
  await verifierInstance.deployed();
  
  const denomination = ethers.BigNumber.from("100000000000000000");
  const merkleTreeHeight = 20;
  const nativeAnchorFactory = new ethers.ContractFactory(nativeAnchorContractRaw.abi, nativeAnchorContractRaw.bytecode, wallet);
  let nativeAnchorInstance = await nativeAnchorFactory.deploy(verifierInstance.address, 
                              hasherInstance.address, denomination, merkleTreeHeight, {gasLimit: '0x5B8D80'});
  const nativeAnchorAddress = await nativeAnchorInstance.deployed();

  console.log(nativeAnchorAddress.address);
  process.exit();
}

deployNativeAnchor()
