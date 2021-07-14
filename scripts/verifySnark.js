// Run these commands to build the circuit and get this test to work:
// - mkdir build
// - mkdir build/circuits
// - npx circom circuits/withdraw.circom -o build/circuits/withdraw.json
// - npx snarkjs setup --protocol groth -c build/circuits/withdraw.json --pk build/circuits/withdraw_proving_key.json --vk build/circuits/withdraw_verification_key.json
// - node node_modules/websnark/tools/buildpkey.js -i build/circuits/withdraw_proving_key.json -o build/circuits/withdraw_proving_key.bin

// Clean the repo and generate your own keys:
// - rm -rf build
// - mkdir build
// - mkdir build/circuits

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
const MerkleTree = require('../lib/MerkleTree')
const NATIVE_AMOUNT=100000000000000000
const MERKLE_TREE_HEIGHT=20

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes))
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]
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
  const recipient = getRandomRecipient();
  const deposit = generateDeposit();
  const fee = bigInt(NATIVE_AMOUNT).shr(1) || bigInt(1e17);
  const refund = bigInt(0);
  const groth16 = await buildGroth16();
  const circuit = require('../build/circuits/withdraw.json');
  const proving_key = fs.readFileSync('../build/circuits/withdraw_proving_key.bin').buffer
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
  let result = snarkVerify(proofData);
  console.log(result);
  return;
}

runScript()