/* global artifacts */
require('dotenv').config({ path: '../.env' })
const NativeAnchor = artifacts.require('NativeAnchor')
const Verifier = artifacts.require('Verifier')
const Hasher = artifacts.require('Hasher')

module.exports = function (deployer) {
  return deployer.then(async () => {
    const { MERKLE_TREE_HEIGHT, ETH_AMOUNT } = process.env
    const verifier = await Verifier.deployed()
    const hasher = await Hasher.deployed()
    const anchor = await deployer.deploy(
      NativeAnchor,
      verifier.address,
      hasher.address,
      ETH_AMOUNT,
      MERKLE_TREE_HEIGHT,
    )
    console.log('NativeAnchor address', anchor.address)
  })
}
