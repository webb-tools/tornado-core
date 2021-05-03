## Initialization

#### build your own verifier to run the evm contracts:
Run these commands to build the circuit and get tests to work with your own keys:
1. npm run build:circuit
2. cp build/circuits/Verifier.sol contracts/Verifier.sol
3. truffle compile
    - follow the compiler on upgrade Verifier.sol to solidity 0.7.6
4. cp .env.example .env




## Running on ganache

1. `ganache-cli -i 1337`
2. `truffle test`




