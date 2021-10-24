// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

enum TileType {
    UNKNOWN,
    WATER,
    BEACH,
    TREE,
    STUMP,
    CHEST,
    FARM,
    LAND
}

struct Tile {
    Coords coords;
    uint256 originalPerlin;
    uint256 originalRaritySeed;
    TileType currentTileType;
}

struct Coords {
    uint256 x;
    uint256 y;
}
