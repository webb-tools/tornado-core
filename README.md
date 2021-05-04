## Initialization

#### build your own verifier to run the evm contracts:
Run these commands to build the circuit and get tests to work with your own keys:
1. `npm run build:circuit`
2. `cp build/circuits/Verifier.sol contracts/Verifier.sol`
3. `truffle compile`
    - follow the compiler on upgrade Verifier.sol to solidity 0.7.6
        - pragma solidity 0.5.0 => 0.7.6
        - Find and replace "sub(gas" with "sub(gas()"
        - Find and replace "@return" with "return"

#### Verify things were built correctly:

1. `cd scripts`
2. `node verifySnark.js`

## Running on ganache

0. `cp .env.example .env`
1. `ganache-cli -i 1337`
2. `truffle test`

## Generate types for your contracts

1. `npm run build:types`


