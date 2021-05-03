## Initialization

#### build your own verifier to run the evm contracts:
Run these commands to build the circuit and get tests to work with your own keys:
1. mkdir build
2. mkdir build/circuits
3. npx circom circuits/withdraw.circom -o build/circuits/withdraw.json
4. npx snarkjs setup --protocol groth -c build/circuits/withdraw.json --pk build/circuits/withdraw_proving_key.json --vk build/circuits/withdraw_verification_key.json
5. node node_modules/websnark/tools/buildpkey.js -i build/circuits/withdraw_proving_key.json -o build/circuits/withdraw_proving_key.bin
6. npx snarkjs generateverifier -v build/circuits/Verifier.sol --vk build/circuits/withdraw_verification_key.json
7. cp build/circuits/Verifier.sol contracts/Verifier.sol
8. follow the compiler on upgrade Verifier.sol to solidity 0.7.6
9. cp .env.example .env




## Running on ganache

1. `ganache-cli -i 1337`
2. `truffle test`




