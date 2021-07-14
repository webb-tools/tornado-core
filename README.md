<h1 align="center">Tornado Core</h1>

<p align="center">
    <strong>Tornado Core Functionality 🌪️</strong>
    <br />
    <sub>Mixers (Anchors) for the EVM</sub>
</p>

<br />

## Build 👷

The repo has been setup with the proving and verifier keys generated from tornado cash's trusted setup ceremony.

1. Install the necessary packages with `npm i`
2. Build the artifacts with `truffle compile`

#### Build your own proving and verifying keys

If one desires, they can run these commands to build the circuit and get tests to work with their own keys:

1. `npm run build:circuit`
2. `cp build/circuits/Verifier.sol contracts/Verifier.sol`
3. `truffle compile`
  - follow the compiler on upgrade Verifier.sol to solidity 0.7.6:
    - pragma solidity 0.5.0 => 0.7.6
    - Find and replace "sub(gas" with "sub(gas()"
    - Find and replace "@return" with "return"

#### Verify the build:

1. `cd scripts`
2. `node verifySnark.js`

If the script returns 'true', the proof generation and verification is successful!

#### Generate typescript types for your contracts

1. `npm run build:types`

## Configuration 🛠️

Our scripts and tests require the configuration of a `.env` file for operation. This also allows for quick changes of networks between ganache and harmony, or any other evm. An example `.env.example` file exists in this repo for reference.

## Interact with the Contracts 

Some scripts have been provided in the `scripts/` directory to interact with mixer contracts.
To use these scripts, `cd scripts` and run `node <script> <...args>`. 

A few that scripts you might find useful are below:
- `deployNativeAnchor.js (<hasher address> <verifier address>)`: This script will deploy a new mixer. The user may optionally provide the command-line arguments of addresses for the hasher and verifier, so as to not waste gas on redeployments. Simply modify the denomination to easily create mixers of different sizes.

- `depositNativeAnchor.js <anchor address>`: This script will make a deposit to the mixer at the passed in address and return the secret note used to withdraw. 

- `withdrawNativeAnchor.js <anchor address> <secret note> <recipient>`: This script will withdraw from the mixer at the address given the secret note and recipient.

## Deployed Contract Instances

1. ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"
``` 
    {
      Hasher: 0x3d7cA3472779Cba193a93E0A412dDB4C12295752
      Verifier: 0xa44A763965228290100645C1b5893355398d937c
      NativeAnchor: 0xFBD61C9961e0bf872B5Ec041b718C0B2a106Ce9D
    }
```

2. Rinkeby
```
    {
      Hasher: 0x50A614Bf1672Bc048201066e60b1A998e9cC3FcA
      Verifier: 0x1fE685Dd2985E3829715c262B9E5eC2b26388D72
      NativeAnchor: 0x876eCe69618e8E8dd743250B036785813824D2D7
    }
```

3. Harmony Testnet Shard 1: 
``` 
    {
      Hasher: 0x96B8Bff1fE9a9c0656b84d7bd1013faD2435Edc0
      Verifier: 0xca2c45fe334fBb9d9356AaB291842b964DB9B0E3
      NativeAnchor: 0x8a4D675dcC71A7387a3C4f27d7D78834369b9542
    }
```

## License

<sup>
Licensed under <a href="LICENSE">GNU General Public License</a>.
</sup>

<br/>

<sub>
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this codebase by you, as defined in the GNU General Public License, shall
be licensed as above, without any additional terms or conditions.
</sub>
