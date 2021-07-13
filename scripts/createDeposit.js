const circomlib = require('circomlib');

const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

module.exports = function createDeposit(nullifier, secret) {
  let deposit = {nullifier, secret};
  deposit.preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)]);
  deposit.commitment = pedersenHash(deposit.preimage);
  deposit.nullifierHash = pedersenHash(deposit.nullifier.leInt2Buff(31));
  return deposit;
}
