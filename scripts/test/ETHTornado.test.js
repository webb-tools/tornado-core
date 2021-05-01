require("dotenv").config()

const fs = require('fs')

const websnarkUtils = require('websnark/src/utils')
const buildGroth16 = require('websnark/src/groth16')
const stringifyBigInts = require('websnark/tools/stringifybigint').stringifyBigInts
const unstringifyBigInts2 = require('snarkjs/src/stringifybigint').unstringifyBigInts
const snarkjs = require('snarkjs')
const bigInt = snarkjs.bigInt
const crypto = require('crypto')
const circomlib = require('circomlib')
const MerkleTree = require('../../lib/MerkleTree')
const ETH_AMOUNT=100000000000000000
const MERKLE_TREE_HEIGHT=20

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes))
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]
const toFixedHex = (number, length = 32) =>
  '0x' +
  bigInt(number)
    .toString(16)
    .padStart(length * 2, '0')
const getRandomRecipient = () => rbigint(20)

function generateDeposit() {
  let deposit = {
    secret: rbigint(31),
    nullifier: rbigint(31),
  }
  const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)])
  deposit.commitment = pedersenHash(preimage)
  return deposit
}

// eslint-disable-next-line no-unused-vars
function BNArrayToStringArray(array) {
  const arrayToPrint = []
  array.forEach((item) => {
    arrayToPrint.push(item.toString())
  })
  return arrayToPrint
}

function snarkVerify(proof) {
  proof = unstringifyBigInts2(proof)
  const verification_key = unstringifyBigInts2(require('../build/circuits/withdraw_verification_key.json'))
  return snarkjs['groth'].isValid(verification_key, proof, proof.publicSignals)
}

async function runScript()
{
  let tree;
  const levels = MERKLE_TREE_HEIGHT || 16;
  let prefix = 'test';
  tree = new MerkleTree(levels, null, prefix);
  const operator = getRandomRecipient();
  const recipient = getRandomRecipient();
  const deposit = generateDeposit();
  const fee = bigInt(ETH_AMOUNT).shr(1) || bigInt(1e17);
  const refund = bigInt(0);
  const groth16 = await buildGroth16();
  const circuit = require('../../build/circuits/withdraw.json');
  const proving_key = fs.readFileSync('../../build/circuits/withdraw_proving_key.bin').buffer
  await tree.insert(deposit.commitment);
  const { root, path_elements, path_index } = await tree.path(0);

  const input = stringifyBigInts({
    root,
    nullifierHash: pedersenHash(deposit.nullifier.leInt2Buff(31)),
    nullifier: deposit.nullifier,
    relayer: 0,
    recipient,
    fee,
    refund,
    secret: deposit.secret,
    pathElements: path_elements,
    pathIndices: path_index,
  });

  let proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key);
  const originalProof = JSON.parse(JSON.stringify(proofData));
  let result = snarkVerify(proofData);
  console.log(result);
}

runScript()