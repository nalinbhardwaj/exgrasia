#!/bin/bash

# Todo this could probably be converted into a hardhat task

# README:
# 1) runs a local blockchain
# 2) deploys a fresh set of all of the contracts (which are in the
#    /eth directory) to that blockchain. check eth/tasks/deploy.ts to
#    find out how we deploy the contract code.

set -ex

# run the deploy script in the background
(
  sleep 2
  yarn workspace eth hardhat:dev deploy $@
) &

# start up local blockchain with hardhat
yarn workspace eth hardhat:node
