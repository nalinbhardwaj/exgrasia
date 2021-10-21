// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

struct ValhallaPlanet {
    uint256 id;
    uint256 mintedAtTimestamp;
    address originalWinner;
    uint8 roundId;
    uint8 level;
    uint8 rank;
    uint8 biome;
}