# zk-tiny-world

This is a starter repository for Ethereum projects that exposes a handful of
build and deploy workflows, for developers who want to be able to develop
quickly on a local blockchain but who also want to manage production smart
contract deployments and upgrades.

## Project Structure

The top-level directories are:

- **eth**: Contains contracts and hardhat tasks for building and deploying, as
  well as tests. If you have an active production deployment of OZ upgradeable
  contracts, this will also track proxy and upgrade metadata in `.openzeppelin`.
  Tests are found in the `test` subdirectory and use hardhat's [recommended
  setup](https://hardhat.org/guides/waffle-testing.html), with ethers.js,
  waffle, mocha, and chai (there's also a recommended VSCode workspace extension
  for running mocha tests in IDE).
- **packages**: Contains any modules that are meant to be consumed by multiple
  services (generally sibling directories of `eth`), such as a frontend `client`
  or an admin webserver. By default, this contains a single `contracts`
  directory, which the Hardhat build/deploy scripts will write deployed contract
  addresses, ABIs, and Typechain artifacts to. This directory is structured so
  that it is easy to generate documentation for modules written into it and to
  and publish these modules to NPM.
- **scripts**: Currently contains a single script,
  `deploy-contracts-locally.sh`, that allows you to spin up a local blockchain
  and deploy contracts.
- **client**: Currently an empty directory. You could write a frontend client
  that interacts with the contracts whose addresses and ABIs are exposed in
  `packages/contracts`.

It is recommended that you develop using VSCode and install the recommended
VSCode extensions. Prettier, eslint, and solhint configs are included.

## Installing Dependencies

This project uses [yarn
workspaces](https://classic.yarnpkg.com/en/docs/workspaces/). Simply run `yarn`
at the root level to install all dependences. This will also trigger a
compilation of the contracts in `eth/contracts` and generation of Typechain
artifacts, via the `yarn prepare` script.

## Scripts and Tasks

### Compiling

The hardhat `compile` task will compile the contracts, generate ABIs, and
generate typechain artifacts (thanks to the `hardhat-typechain` plugin). These
ABIs and typechain artifacts are then placed into the `packages/contracts`
directory.

This task can be run with `hardhat compile` or `yarn compile` in `eth`. It's
also run on `yarn` (via `prepare`).

### Deploying

Run `yarn hardhat:dev deploy` in `eth` to deploy to an already-running local
hardhat network.

Running `scripts/deploy-contracts-locally.sh` will spin up a local hardhat
network and run the hardhat deploy task in the same terminal.

To deploy to xDAI, run `yarn hardhat:xdai deploy` in `eth`. To deploy to
mainnet, run `yarn hardhat:mainnet deploy`.

These commands will write the contract addresses and network info into
`packages/contracts/index.ts` and update the manifest in `.openzeppelin` that is
used to keep track of upgrades and proxies. These files are by default checked
in, so we suggest associating production deployments with specific production
branches in Github, but checking in your dev network artifacts (which will not
change except when adding new contracts or libraries) to a `develop` branch.

### Upgrading

Run `yarn hardhat:[dev/xdai/mainnet] upgrade:[core/getters]` in `eth` to compile
the latest state of your contracts and upgrade. You should make sure that you
have the appropriate `.openzeppelin` manifest files.

### Testing

Run `yarn test` in `eth` to run contract tests. If you have the Mocha test
adapter VSCode extension involved, you can also run your tests in the VSCode
IDE.

### Other Utilities

`eth/tasks/wallet.ts` contains a few useful tasks for sending ether, creating
new Ethereum accounts, etc.
