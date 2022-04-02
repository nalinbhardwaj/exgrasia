// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "./TinyWorldRegistry.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    event PlayerUpdated(address, Coords);
    event TileUpdated(Tile);
    TinyWorldRegistry public registry;

    function initialize(
        uint256 _seed,
        uint256 _worldWidth,
        uint256 _worldScale,
        address _registryAddress
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
        validPlayerEmoji["monkey"] = unicode"🐵";
        validPlayerEmoji["bear"] = unicode"🐻";
        validPlayerEmoji["frog"] = unicode"🐸";
        validPlayerEmoji["dog"] = unicode"🐶";
        validPlayerEmoji["cat"] = unicode"🐱";
        validPlayerEmoji["mouse"] = unicode"🐭";

        registry = TinyWorldRegistry(address(_registryAddress));
    }

    // Perlin Noise
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

        return
            ABDKMath64x64.divi(int256(resNumerator), int256(vecsDenom) * int256(int32(scale))**3);
    }

    function computePerlin(
        uint32 x,
        uint32 y,
        uint32 seed,
        uint32 scale
    ) public view returns (uint256) {
        int128 perlin = ABDKMath64x64.fromUInt(0);

        for (uint8 i = 0; i < 3; i++) {
            int128 v = getSingleScalePerlin(x, y, scale * uint32(2**i), seed);
            perlin = ABDKMath64x64.add(perlin, v);
        }
        perlin = ABDKMath64x64.add(perlin, getSingleScalePerlin(x, y, scale * uint32(2**0), seed));

        perlin = ABDKMath64x64.div(perlin, ABDKMath64x64.fromUInt(4));
        int128 perlinScaledShifted = ABDKMath64x64.add(
            ABDKMath64x64.mul(perlin, ABDKMath64x64.fromUInt(uint256(perlinMax / 2))),
            ABDKMath64x64.fromUInt((uint256(perlinMax / 2)))
        );

        return ABDKMath64x64.toUInt(perlinScaledShifted);
    }

    // Map parametrisation
    function getRaritySeed(Coords memory coords) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(coords.x, coords.y))) % 8;
    }

    function coordsToTile(Coords memory coords) private view returns (Tile memory) {
        uint256 perlin1 = computePerlin(
            uint32(coords.x),
            uint32(coords.y),
            uint32(seed),
            uint32(worldScale)
        );
        uint256 perlin2 = computePerlin(
            uint32(coords.x),
            uint32(coords.y),
            uint32(seed + 1),
            uint32(worldScale)
        );
        uint256 raritySeed = getRaritySeed(coords);

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

        TileType tileType = TileType.UNKNOWN;
        if (temperatureType == TemperatureType.COLD) {
            if (altitudeType == AltitudeType.MOUNTAINTOP) {
                tileType = TileType.SNOW;
            } else if (altitudeType == AltitudeType.MOUNTAIN) {
                tileType = TileType.SNOW;
            } else if (altitudeType == AltitudeType.LAND) {
                tileType = TileType.SNOW;
            } else if (altitudeType == AltitudeType.BEACH) {
                tileType = TileType.SNOW;
            } else {
                tileType = TileType.WATER;
            }
        } else if (temperatureType == TemperatureType.NORMAL) {
            if (altitudeType == AltitudeType.MOUNTAINTOP) {
                tileType = TileType.SNOW;
            } else if (altitudeType == AltitudeType.MOUNTAIN) {
                tileType = TileType.STONE;
            } else if (altitudeType == AltitudeType.LAND) {
                tileType = TileType.GRASS;
            } else if (altitudeType == AltitudeType.BEACH) {
                tileType = TileType.SAND;
            } else {
                tileType = TileType.WATER;
            }
        } else {
            if (altitudeType == AltitudeType.MOUNTAINTOP) {
                tileType = TileType.STONE;
            } else if (altitudeType == AltitudeType.MOUNTAIN) {
                tileType = TileType.SAND;
            } else if (altitudeType == AltitudeType.LAND) {
                tileType = TileType.SAND;
            } else if (altitudeType == AltitudeType.BEACH) {
                tileType = TileType.SAND;
            } else {
                tileType = TileType.WATER;
            }
        }

        return
            Tile({
                coords: coords,
                perlin: [perlin1, perlin2],
                raritySeed: raritySeed,
                tileType: tileType,
                temperatureType: temperatureType,
                altitudeType: altitudeType,
                owner: address(0),
                smartContract: address(0),
                lastPurchased: 0
            });
    }

    // Mapping
    function getTile(Coords memory coords) public returns (Tile memory) {
        if (cachedTiles[coords.x][coords.y].tileType == TileType.UNKNOWN) {
            cachedTiles[coords.x][coords.y] = coordsToTile(coords);
            touchedCoords.push(coords);
        }
        return cachedTiles[coords.x][coords.y];
    }

    // Movement
    function getInitSeedCoords() private view returns (Coords memory coords) {
        uint256 x = (uint256(
            keccak256(
                abi.encodePacked(
                    uint256(uint160(address(msg.sender))),
                    uint256(seed),
                    uint256(block.timestamp)
                )
            )
        ) % 8);
        uint256 y = (uint256(
            keccak256(
                abi.encodePacked(
                    uint256(uint160(address(msg.sender))),
                    uint256(seed + 42),
                    uint256(block.timestamp)
                )
            )
        ) % worldWidth);
        return Coords(worldWidth - x - 1, worldWidth - y - 1);
    }

    function abs(int256 x) private pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }

    function dist(Coords memory a, Coords memory b) public pure returns (uint256) {
        return abs(int256(a.x) - int256(b.x)) + abs(int256(a.y) - int256(b.y));
    }

    modifier isClose(Coords memory loc) {
        require(playerInited[msg.sender], "Player not inited");
        require(dist(playerLocation[msg.sender], loc) <= 1, "Location too far");
        _;
    }

    modifier isInBounds(Coords memory loc) {
        require(playerInited[msg.sender], "Player not inited");
        require(loc.x >= 1 && loc.x < worldWidth, "X out of bounds");
        require(loc.y >= 1 && loc.y < worldWidth, "Y out of bounds");
        _;
    }

    function initPlayerLocation(string memory repr) public {
        require(registry.getRealAddress(msg.sender) != address(0), "Player not registered");
        require(playerInited[msg.sender] == false, "Already inited");
        require(bytes(validPlayerEmoji[repr]).length > 0, "Invalid emoji");
        Coords memory coords = getInitSeedCoords();

        playerLocation[msg.sender] = coords;
        playerInited[msg.sender] = true;
        playerEmoji[msg.sender] = validPlayerEmoji[repr];
        playerIds.push(msg.sender);
        emit PlayerUpdated(msg.sender, coords);
    }

    function movePlayer(Coords memory coords) public isClose(coords) isInBounds(coords) {
        playerLocation[msg.sender] = coords;
        emit PlayerUpdated(msg.sender, coords);
    }

    function checkInterface(address smartContract) internal view {
        string[4] memory functions = [
            "tileEmoji((uint256,uint256))",
            "tileName((uint256,uint256))",
            "tileDescription((uint256,uint256))",
            "tileABI((uint256,uint256))"
        ];

        for (uint256 i = 0; i < 4; i++) {
            bytes memory res = AddressUpgradeable.functionStaticCall(
                smartContract,
                abi.encodeWithSignature(functions[i], Coords(1, 1)),
                string(abi.encodePacked("Address: low-level static call failed - ", functions[i]))
            );
            require(res.length > 0, "Invalid interface");
        }
    }

    function ownTile(Coords memory coords, address smartContract)
        public
        isClose(coords)
        isInBounds(coords)
    {
        Tile memory tile = getTile(coords);
        require(
            block.timestamp - tile.lastPurchased > 3 hours || tile.owner == msg.sender,
            "Tile already owned"
        );
        checkInterface(smartContract);
        tile.smartContract = smartContract;
        tile.lastPurchased = block.timestamp;
        tile.owner = msg.sender;
        cachedTiles[coords.x][coords.y] = tile;
        emit TileUpdated(tile);
    }

    function transferTile(Coords memory coords, address newOwner)
        public
        isClose(coords)
        isInBounds(coords)
    {
        Tile memory tile = getTile(coords);
        require(
            block.timestamp - tile.lastPurchased <= 3 hours && tile.owner == msg.sender,
            "Tile not owned"
        );
        tile.owner = newOwner;
        cachedTiles[coords.x][coords.y] = tile;
        emit TileUpdated(tile);
    }

    function forceTileUpdate(Coords memory coords) public {
        Tile memory tile = getTile(coords);
        require(tile.smartContract == msg.sender, "Not owner");
        emit TileUpdated(tile);
    }
}
