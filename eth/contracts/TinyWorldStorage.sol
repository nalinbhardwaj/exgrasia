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
    address questMaster;

    mapping(uint256 => mapping(uint256 => Tile)) public cachedTiles;
    Coords[] public touchedCoords;

    mapping(address => Coords) public playerLocation;
    mapping(address => bool) public playerInited;
    mapping(address => string) public playerEmoji;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public canMoveWater;
    mapping(address => bool) public canMoveSnow;

    mapping(string => string) public validPlayerEmoji;

    function getCachedTile(Coords memory coords) public view returns (Tile memory) {
        return cachedTiles[coords.x][coords.y];
    }

    function getTouchedTiles() public view returns (Tile[] memory) {
        Tile[] memory touchedTiles = new Tile[](touchedCoords.length);
        for (uint256 i = 0; i < touchedCoords.length; i++) {
            touchedTiles[i] = getCachedTile(touchedCoords[i]);
        }
        return touchedTiles;
    }

    function getPlayerIds() public view returns (address[] memory) {
        return playerIds;
    }

    function getPlayerInfos()
        public
        view
        returns (
            Coords[] memory,
            string[] memory,
            bool[] memory,
            bool[] memory
        )
    {
        Coords[] memory retLoc = new Coords[](playerIds.length);
        string[] memory retEmoji = new string[](playerIds.length);
        bool[] memory retCanMoveWater = new bool[](playerIds.length);
        bool[] memory retCanMoveSnow = new bool[](playerIds.length);
        for (uint256 i = 0; i < playerIds.length; i++) {
            retLoc[i] = playerLocation[playerIds[i]];
            retEmoji[i] = playerEmoji[playerIds[i]];
            retCanMoveWater[i] = canMoveWater[playerIds[i]];
            retCanMoveSnow[i] = canMoveSnow[playerIds[i]];
        }
        return (retLoc, retEmoji, retCanMoveWater, retCanMoveSnow);
    }

    function getPlayerLocation(address player) public view returns (Coords memory) {
        return playerLocation[player];
    }

    function getContractLocations(address contractAddress) public view returns (Coords[] memory) {
        uint256 locCount = 0;
        for (uint256 i = 0; i < touchedCoords.length; i++) {
            if (getCachedTile(touchedCoords[i]).smartContract == contractAddress) locCount++;
        }
        Coords[] memory ret = new Coords[](locCount);
        uint256 locIndex = 0;
        for (uint256 i = 0; i < touchedCoords.length; i++) {
            if (getCachedTile(touchedCoords[i]).smartContract == contractAddress) {
                ret[locIndex] = touchedCoords[i];
                locIndex++;
            }
        }
        return ret;
    }
}
