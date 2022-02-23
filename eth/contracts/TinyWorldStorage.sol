// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./Types.sol";

contract TinyWorldStorage {
    uint256 public seed;
    uint256 public worldWidth;
    uint256 public worldScale;
    int16[2][16] public vecs;
    int16 public vecsDenom;
    uint16 public perlinMax;
    address[] public playerIds;

    mapping(uint256 => mapping(uint256 => Tile)) public cachedTiles;
    Tile[] public touchedTiles;

    mapping(address => Coords) public playerLocation;
    mapping(address => bool) public playerInited;

    function getCachedTile(Coords memory coords) public view returns (Tile memory) {
        return cachedTiles[coords.x][coords.y];
    }

    function getTouchedTiles() public view returns (Tile[] memory) {
        return touchedTiles;
    }

    function getPlayerIds() public view returns (address[] memory) {
        return playerIds;
    }

    function getPlayerLocations() public view returns (Coords[] memory) {
        Coords[] memory ret = new Coords[](playerIds.length);
        for (uint256 i = 0; i < playerIds.length; i++) {
            ret[i] = playerLocation[playerIds[i]];
        }
        return ret;
    }
}
