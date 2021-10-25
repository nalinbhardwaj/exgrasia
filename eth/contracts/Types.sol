// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

enum TileType {UNKNOWN, WATER, SAND, TREE, STUMP, CHEST, FARM, WINDMILL, GRASS, SNOW, STONE, ICE}

enum TemperatureType {COLD, NORMAL, HOT}

enum AltitudeType {SEA, BEACH, LAND, MOUNTAIN, MOUNTAINTOP}

struct Tile {
    Coords coords;
    uint256[2] perlin;
    uint256 raritySeed;
    TileType currentTileType;
}

struct Coords {
    uint256 x;
    uint256 y;
}
