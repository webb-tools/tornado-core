const MerkleTree = require('../lib/MerkleTree')
const fs = require('fs')

const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });
const websnarkUtils = require('websnark/src/utils')
const buildGroth16 = require('websnark/src/groth16')
const stringifyBigInts = require('websnark/tools/stringifybigint').stringifyBigInts
const unstringifyBigInts2 = require('snarkjs/src/stringifybigint').unstringifyBigInts
const snarkjs = require('snarkjs');
const circomlib = require('circomlib');
const bigInt = snarkjs.bigInt;

const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]

let provider, privateKey;

if (process.env.USING_GANACHE) {
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    privateKey = process.env.PRIVATE_KEY_ETH;
}
else {
    provider = new ethers.providers.JsonRpcProvider('http://localhost:9933');
    privateKey = process.env.PRIVATE_KEY_SUB;
}

const toFixedHex = (number, length = 32) =>
  '0x' +
  bigInt(number)
    .toString(16)
    .padStart(length * 2, '0');

// Accept as command-line input necessary values (contract address, nullifier, and secret)
const contractAddress = process.argv[2];

// These are stringified big ints as inputs
const bigIntStrNullifier = process.argv[3];
const bigIntStrSecret = process.argv[4];

// Initialize some defaults, TODO: overwriteable with arguments
const recipient = "0xc38d21E18C8d1b7a0a255a6D222b0310a1562d36";
const relayer = "0xd644f5331a6F26A7943CEEbB772e505cDDd21700";
const fee = bigInt(1e17);
const refund = bigInt(0);

const formattedNullifier = unstringifyBigInts2(bigIntStrNullifier);
const formattedSecret = unstringifyBigInts2(bigIntStrSecret);

const buffNullifier = formattedNullifier.leInt2Buff(31);

const wallet = new ethers.Wallet(privateKey, provider);
const anchorAbi = require("../build/contracts/Anchor.json");
const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, wallet);

async function getDepositEvents() {
    // Query the blockchain for all deposits that have happened
    const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
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

async function getLeafIndex(decodedEvents, nullifier, secret) {
    // build the commitment from the nullifier and secret
    const preimage = Buffer.concat([nullifier.leInt2Buff(31), secret.leInt2Buff(31)]);
    const commitment = pedersenHash(preimage);

    // search the deposit events to retrieve the leaf index
    for (var i=0; i<decodedEvents.length; i++)
    {
        if (decodedEvents[i].args.commitment == commitment)
        {
            return decodedEvents[i].args.leafIndex;
        }
    }
}

async function buildLocalTree(decodedEvents) {
    let levels = 20;
    let prefix = 'test';
    let tree = new MerkleTree(levels, null, prefix);

    // may need to sort this arr by leafIndex
    for (var i=0; i<decodedEvents.length; i++)
    {
        await tree.insert(decodedEvents[i].args.commitment);
    }

    return tree;
}

async function genProofAndSubmit(localTree, leafIndex, nullifier, secret) {
    // find the inputs that correspond to the path for the deposit
    const { root, path_elements, path_index } = await localTree.path(leafIndex);

    let groth16 = await buildGroth16();
    let circuit = require('../build/circuits/withdraw.json');
    let proving_key = fs.readFileSync('../build/circuits/withdraw_proving_key.bin').buffer;

    // Circuit input
    const input = stringifyBigInts({
        // public
        root,
        nullifierHash: pedersenHash(buffNullifier), //d4f8decaec85f87793e8c76b3ccb8b40da33884ce560da2c625a728e22ec2a
        relayer,
        recipient,
        fee,
        refund,

        // private
        nullifier: nullifier,
        secret: secret,
        pathElements: path_elements,
        pathIndices: path_index,
    })

    const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key)
    const { proof } = websnarkUtils.toSolidityInput(proofData)

    const args = [
        toFixedHex(input.root),
        toFixedHex(input.nullifierHash),
        toFixedHex(input.recipient, 20),
        toFixedHex(input.relayer, 20),
        toFixedHex(input.fee),
        toFixedHex(input.refund),
    ]

    const logs = await anchorInstance.withdraw(proof, ...args, { from: relayer })

    return logs;
}

async function runScript() {
    const deposits = await getDepositEvents();
    const localTree = await buildLocalTree(deposits);
    const leafIndex = await getLeafIndex(deposits, formattedNullifier, formattedSecret);
    genProofAndSubmit(localTree, leafIndex, formattedNullifier, formattedSecret);
}

runScript();
