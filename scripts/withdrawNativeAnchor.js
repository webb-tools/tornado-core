const MerkleTree = require('../lib/MerkleTree')
const fs = require('fs')

const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });
const websnarkUtils = require('websnark/src/utils')
const buildGroth16 = require('websnark/src/groth16')
const stringifyBigInts = require('websnark/tools/stringifybigint').stringifyBigInts
const unstringifyBigInts2 = require('snarkjs/src/stringifybigint').unstringifyBigInts
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const circomlib = require('circomlib');
const bigInt = snarkjs.bigInt;

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes))
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]

let provider;
if (process.env.USING_GANACHE) {
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
}
else {
    provider = new ethers.providers.JsonRpcProvider('http://localhost:9933');
}
const contractAddress = process.argv[2];

const anchorAbi = require("../build/contracts/Anchor.json");

// eslint-disable-next-line no-unused-vars
function BNArrayToStringArray(array) {
    const arrayToPrint = []
    array.forEach((item) => {
      arrayToPrint.push(item.toString())
    })
    return arrayToPrint
  }

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function generateDeposit() {
    let deposit = {
        secret: rbigint(31),
        nullifier: rbigint(31),
    };
    const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)]);
    const arrValues = BNArrayToStringArray(preimage);
    console.log('Nullifier: ' + toHexString(arrValues.slice(0,31)));
    console.log('Secret: ' + toHexString(arrValues.slice(31,62)));
    deposit.commitment = pedersenHash(preimage);
    return deposit;
}

async function getDepositEvent() {
    let levels = 20;
    let prefix = 'test'; //change this to whatever was deployed with mixer
    let tree = new MerkleTree(levels, null, prefix);
    let groth16 = await buildGroth16();
    let circuit = require('../build/circuits/withdraw.json');
    let proving_key = fs.readFileSync('../build/circuits/withdraw_proving_key.bin').buffer

    const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
    const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

    const depositFilterResult = await anchorInstance.filters.Deposit();

    const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: contractAddress,
        topics: [depositFilterResult.topics]
    });

    const decodedEvents = await logs.map(log => {
        return anchorInterface.parseLog(log);
    })

    // console.log(decodedEvents[0].args.commitment);

    await tree.insert(decodedEvents[0].args.commitment);

    const { root, path_elements, path_index } = await tree.path(0);
    const fee = bigInt(1e17)
    const refund = bigInt(0)
    const recipient = "0xc38d21E18C8d1b7a0a255a6D222b0310a1562d36"

    const genDeposit = generateDeposit();

    // Circuit input
    const input = stringifyBigInts({
        // public
        root,
        nullifierHash: pedersenHash(genDeposit.nullifier.leInt2Buff(31)), //d4f8decaec85f87793e8c76b3ccb8b40da33884ce560da2c625a728e22ec2a
        relayer: "0xd644f5331a6F26A7943CEEbB772e505cDDd21700",
        recipient,
        fee,
        refund,

        // private
        nullifier: genDeposit.nullifier.leInt2Buff(31),
        secret: "b137289f1b1beb76974de9027b77e1aea584af6a21b860754a80047d7bb2ef",
        pathElements: path_elements,
        pathIndices: path_index,
    })

    console.log(input);

    const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key)
    const { proof } = websnarkUtils.toSolidityInput(proofData)

    // Uncomment to measure gas usage
    // gas = await anchor.withdraw.estimateGas(proof, publicSignals, { from: relayer, gasPrice: '0' })
    // console.log('withdraw gas:', gas)
    const args = [
    toFixedHex(input.root),
    toFixedHex(input.nullifierHash),
    toFixedHex(input.recipient, 20),
    toFixedHex(input.relayer, 20),
    toFixedHex(input.fee),
    toFixedHex(input.refund),
    ]

    const { logsAnchor } = await anchor.withdraw(proof, ...args, { from: relayer, gasPrice: '0' })

}

getDepositEvent();
