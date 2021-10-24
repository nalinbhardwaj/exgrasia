# circom-starter

A basic circom project using [Hardhat](https://github.com/nomiclabs/hardhat) and [hardhat-circom](https://github.com/projectsophon/hardhat-circom). This combines the multiple steps of the [Circom](https://github.com/iden3/circom) and [SnarkJS](https://github.com/iden3/snarkjs) workflow into your [Hardhat](https://hardhat.org) workflow.

By providing configuration containing your Phase 1 Powers of Tau and circuits, hardhat-circom will:

1. Compile the circuits
2. Apply the final beacon
3. Output your `wasm` and `zkey` files
4. Generate and output a `Verifier.sol`

## Running the circuits and compiling the chain etc

In 3 terminals, run:

```
cd packages/zk && yarn circom:dev
yarn circom:cp
cd ../../client && yarn start:dev // In terminal 2
cd scripts && sh deploy-contracts-locally.sh // In terminal 3
```

Using fake Perlin:

```
cd packages/zk && yarn circom:dev:fake
yarn circom:cp:fake
```

## Manipulation

In browser console, can verify by running the following (note gm = GameManager):

`gm...`

## Documentation

See the source projects for full documentation and configuration

## Install

`yarn` to install dependencies

## Development builds

`yarn circom:dev` to build deterministic development circuits.

Further, for debugging purposes, you may wish to inspect the intermediate files. This is possible with the `--debug` flag which the `circom:dev` task enables by default. You'll find them (by default) in `artifacts/circom/`

## Production builds

`yarn circom:prod` for production builds (using `Date.now()` as entropy)
