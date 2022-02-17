// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./FPMath.sol";
import "./ProveTileVerifier.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    event TileUpdated(Tile);
    event PlayerUpdated(Coords);

    function seedToTileType(
        Coords memory coords,
        uint256 perlin1,
        uint256 perlin2,
        uint256 raritySeed
    ) private pure returns (TileType) {
        uint256 height = perlin1;
        uint256 temperature = perlin2;
        temperature = uint256(int256(temperature) + (int256(coords.x) - 50) / 2);

        AltitudeType altitudeType = AltitudeType.SEA;
        if (height > 40) {
            altitudeType = AltitudeType.MOUNTAINTOP;
        } else if (height > 37) {
            altitudeType = AltitudeType.MOUNTAIN;
        } else if (height > 32) {
            altitudeType = AltitudeType.LAND;
        } else if (height > 30) {
            altitudeType = AltitudeType.BEACH;
        }

        TemperatureType temperatureType = TemperatureType.COLD;
        if (temperature > 42) {
            temperatureType = TemperatureType.HOT;
        } else if (temperature > 22) {
            temperatureType = TemperatureType.NORMAL;
        }

        if (temperatureType == TemperatureType.COLD) {
            if (altitudeType == AltitudeType.MOUNTAINTOP) {
                return TileType.SNOW;
            } else if (altitudeType == AltitudeType.MOUNTAIN) {
                return TileType.SNOW;
            } else if (altitudeType == AltitudeType.LAND) {
                return TileType.SNOW;
            } else if (altitudeType == AltitudeType.BEACH) {
                if (raritySeed < 12) {
                    return TileType.ICE;
                }
                return TileType.SNOW;
            } else {
                if (raritySeed < 2) {
                    return TileType.ICE;
                }
                return TileType.WATER;
            }
        } else if (temperatureType == TemperatureType.NORMAL) {
            if (altitudeType == AltitudeType.MOUNTAINTOP) {
                return TileType.SNOW;
            } else if (altitudeType == AltitudeType.MOUNTAIN) {
                return TileType.STONE;
            } else if (altitudeType == AltitudeType.LAND) {
                if (raritySeed < 1) {
                    return TileType.TREE;
                }
                return TileType.GRASS;
            } else if (altitudeType == AltitudeType.BEACH) {
                return TileType.SAND;
            } else {
                return TileType.WATER;
            }
        } else {
            if (altitudeType == AltitudeType.MOUNTAINTOP) {
                return TileType.STONE;
            } else if (altitudeType == AltitudeType.MOUNTAIN) {
                if (raritySeed < 8) {
                    return TileType.STONE;
                }
                return TileType.SAND;
            } else if (altitudeType == AltitudeType.LAND) {
                return TileType.SAND;
            } else if (altitudeType == AltitudeType.BEACH) {
                if (raritySeed < 6) {
                    return TileType.GRASS;
                }
                return TileType.SAND;
            } else {
                return TileType.WATER;
            }
        }
    }

    function abs(int256 x) private pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }

    function dist(Coords memory a, Coords memory b) private pure returns (uint256) {
        return abs(int256(a.x) - int256(b.x)) + abs(int256(a.y) - int256(b.y));
    }

    modifier isClose(Coords memory loc) {
        require(playerInited[msg.sender], "Player not inited");
        require(dist(playerLocation[msg.sender], loc) <= 1, "Location too far");
        _;
    }

    function initialize(
        uint256 _seed,
        uint256 _worldWidth,
        uint256 _worldScale
    ) public initializer {
        __Ownable_init();
        seed = _seed;
        worldWidth = _worldWidth;
        worldScale = _worldScale;
        perlinMax = 64;
        vecsDenom = 1000;
        vecs = [
            [int16(1000), int16(0)],
            [int16(923), int16(382)],
            [int16(707), int16(707)],
            [int16(382), int16(923)],
            [int16(0), int16(1000)],
            [int16(-383), int16(923)],
            [int16(-708), int16(707)],
            [int16(-924), int16(382)],
            [int16(-1000), int16(0)],
            [int16(-924), int16(-383)],
            [int16(-708), int16(-708)],
            [int16(-383), int16(-924)],
            [int16(-1), int16(-1000)],
            [int16(382), int16(-924)],
            [int16(707), int16(-708)],
            [int16(923), int16(-383)]
        ];
    }

    // interpolation function [0,1] -> [0,1]
    function smoothStep(int128 x) public pure returns (int128) {
        return x;
    }

    // returns a random unit vector
    // implicit denominator of vecsDenom
    function getGradientAt(
        uint32 x,
        uint32 y,
        uint32 scale,
        uint32 seed
    ) public view returns (int16[2] memory) {
        uint256 idx = uint256(keccak256(abi.encodePacked(x, y, scale, seed))) % 16;
        return vecs[idx];
    }

    // the computed perlin value at a point is a weighted average of dot products with
    // gradient vectors at the four corners of a grid square.
    // this isn't scaled; there's an implicit denominator of scale ** 2
    function getWeight(
        uint32 cornerX,
        uint32 cornerY,
        uint32 x,
        uint32 y,
        uint32 scale
    ) public pure returns (uint64) {
        uint64 res = 1;

        if (cornerX > x) res *= (scale - (cornerX - x));
        else res *= (scale - (x - cornerX));

        if (cornerY > y) res *= (scale - (cornerY - y));
        else res *= (scale - (y - cornerY));

        return res;
    }

    function getCorners(
        uint32 x,
        uint32 y,
        uint32 scale
    ) public pure returns (uint32[2][4] memory) {
        uint32 lowerX = (x / scale) * scale;
        uint32 lowerY = (y / scale) * scale;

        return [
            [lowerX, lowerY],
            [lowerX + scale, lowerY],
            [lowerX + scale, lowerY + scale],
            [lowerX, lowerY + scale]
        ];
    }

    function getSingleScalePerlin(
        uint32 x,
        uint32 y,
        uint32 scale,
        uint32 seed
    ) public view returns (int128) {
        uint32[2][4] memory corners = getCorners(x, y, scale);

        int128 resNumerator = 0;

        for (uint8 i = 0; i < 4; i++) {
            uint32[2] memory corner = corners[i];

            // this has an implicit denominator of scale
            int32[2] memory offset = [int32(x) - int32(corner[0]), int32(y) - int32(corner[1])];

            // this has an implicit denominator of vecsDenom
            int16[2] memory gradient = getGradientAt(corner[0], corner[1], scale, seed);

            // this has an implicit denominator of vecsDenom * scale
            int64 dot = offset[0] * int64(gradient[0]) + offset[1] * int64(gradient[1]);

            // this has an implicit denominator of scale ** 2
            uint64 weight = getWeight(corner[0], corner[1], x, y, scale);

            // this has an implicit denominator of vecsDenom * scale ** 3
            resNumerator += int128(int64(weight)) * int128(dot);
        }

        return FPMath.divi(int256(resNumerator), int256(vecsDenom) * int256(int32(scale))**3);
    }

    function computePerlin(
        uint32 x,
        uint32 y,
        uint32 seed,
        uint32 scale
    ) public view returns (uint256) {
        int128 perlin = FPMath.fromUInt(0);

        for (uint8 i = 0; i < 3; i++) {
            int128 v = getSingleScalePerlin(x, y, scale * uint32(2**i), seed);
            perlin = FPMath.add(perlin, v);
        }
        perlin = FPMath.add(perlin, getSingleScalePerlin(x, y, scale * uint32(2**0), seed));

        perlin = FPMath.div(perlin, FPMath.fromUInt(4));
        int128 perlinScaledShifted = FPMath.add(
            FPMath.mul(perlin, FPMath.fromUInt(uint256(32))),
            FPMath.fromUInt((uint256(32)))
        );

        return FPMath.toUInt(perlinScaledShifted);
    }

    function initPlayerLocation(Coords memory coords) public {
        require(playerInited[msg.sender] == false, "Already inited");
        playerLocation[msg.sender] = coords;
        playerInited[msg.sender] = true;
        emit PlayerUpdated(coords);
    }

    function movePlayer(Coords memory coords) public isClose(coords) {
        require(
            cachedTiles[coords.x][coords.y].currentTileType != TileType.UNKNOWN,
            "Tile not proven"
        );
        playerLocation[msg.sender] = coords;
        emit PlayerUpdated(coords);
    }

    function processTile(Coords memory coords, uint256 tsbase) public {
        uint256 perlinBase1 = computePerlin(
            uint32(coords.x),
            uint32(coords.y),
            uint32(seed),
            uint32(worldScale)
        );
        uint256 perlinBase2 = computePerlin(
            uint32(coords.x),
            uint32(coords.y),
            uint32(seed + 1),
            uint32(worldScale)
        );

        require(tsbase == perlinBase2, "ALL YOUR BASE ARE MINE");
    }
}
