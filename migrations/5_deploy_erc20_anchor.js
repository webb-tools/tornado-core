/* global artifacts */
require('dotenv').config({ path: '../.env' })
const ERC20Anchor = artifacts.require('ERC20Anchor')
const Verifier = artifacts.require('Verifier')
const Hasher = artifacts.require('Hasher')
const ERC20Mock = artifacts.require('ERC20Mock')

module.exports = function (deployer) {
  return deployer.then(async () => {
    const { MERKLE_TREE_HEIGHT, ERC20_TOKEN, TOKEN_AMOUNT } = process.env
    const verifier = await Verifier.deployed()
    const hasher = await Hasher.deployed()
    let token = ERC20_TOKEN
    if (token === '') {
      const tokenInstance = await deployer.deploy(ERC20Mock)
      token = tokenInstance.address
    }
    const anchor = await deployer.deploy(
      ERC20Anchor,
      verifier.address,
      hasher.address,
      TOKEN_AMOUNT,
      MERKLE_TREE_HEIGHT,
      token,
    )
    console.log('ERC20Anchor address', anchor.address)
  })
}
