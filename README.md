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

#### Generate types for your contracts

1. `npm run build:types`

## Testing on ganache

0. `cp .env.example .env`
1. `ganache-cli`
2. `truffle test`

#### Interact with the contracts on ganache

1. `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
2. `truffle migrate`

#### Deployed Contract Instances

1. Beresheet = {

}

2. Rinkeby = {
    Hasher: 0x50A614Bf1672Bc048201066e60b1A998e9cC3FcA
    Verifier: 0x1fE685Dd2985E3829715c262B9E5eC2b26388D72
    NativeAnchor: 0x876eCe69618e8E8dd743250B036785813824D2D7
    ERC20Anchor: 0xbbE593Eda23954747195fDCFF099cbb4EaF627F1
}


