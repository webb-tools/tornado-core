// This script takes in a note string and generates a deposit object
const { bigInt } = require('snarkjs');
const createDeposit = require('./createDeposit');

module.exports = function parseNote(noteString) {
  const noteRegex = /anchor-(?<currency>\w+)-(?<amount>[\d.]+)-(?<chainId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g
  const match = noteRegex.exec(noteString);

  const buf = Buffer.from(match.groups.note, 'hex');
  const nullifier = bigInt.leBuff2int(buf.slice(0, 31));
  const secret = bigInt.leBuff2int(buf.slice(31, 62));
  return createDeposit(nullifier, secret);
}