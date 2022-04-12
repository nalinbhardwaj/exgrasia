// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./TinyWorldRegistry.sol";
import "./Perlin.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    event PlayerUpdated(address, Coords);
    event TileUpdated(Tile);
    TinyWorldRegistry public registry;

    function initialize(
        uint256 _seed,
        uint256 _worldWidth,
        uint256 _worldScale,
        address _registryAddress,
        address[] memory _admins
    ) public initializer {
        __Ownable_init();
        seed = _seed;
        worldWidth = _worldWidth;
        worldScale = _worldScale;
        validPlayerEmoji["monkey"] = unicode"🐵";
        validPlayerEmoji["bear"] = unicode"🐻";
        validPlayerEmoji["frog"] = unicode"🐸";
        validPlayerEmoji["dog"] = unicode"🐶";
        validPlayerEmoji["cat"] = unicode"🐱";
        validPlayerEmoji["mouse"] = unicode"🐭";

        registry = TinyWorldRegistry(address(_registryAddress));
        for (uint256 i = 0; i < _admins.length; i++) {
            isAdmin[_admins[i]] = true;
        }
    }

    // Map parametrisation
    function getRaritySeed(Coords memory coords) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(coords.x, coords.y))) % 8;
    }

    function coordsToTile(Coords memory coords) private view returns (Tile memory) {
        uint256 perlin1 = Perlin.computePerlin(
            uint32(coords.x),
            uint32(coords.y),
            uint32(seed),
            uint32(worldScale)
        );
        uint256 perlin2 = Perlin.computePerlin(
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
        ) % 10);
        uint256 y = (uint256(
            keccak256(
                abi.encodePacked(
                    uint256(uint160(address(msg.sender))),
                    uint256(seed + 42),
                    uint256(block.timestamp)
                )
            )
        ) % 30);
        return Coords(worldWidth - x - 1, y);
    }

    function abs(int256 x) private pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }

    function dist(Coords memory a, Coords memory b) public pure returns (uint256) {
        return abs(int256(a.x) - int256(b.x)) + abs(int256(a.y) - int256(b.y));
    }

    modifier isClose(Coords memory loc) {
        require(playerInited[msg.sender], "Player not inited");
        require(
            dist(playerLocation[msg.sender], loc) <= 1 || isAdmin[msg.sender],
            "Location too far"
        );
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
        Tile memory tile = getTile(coords);
        require(
            tile.tileType != TileType.WATER || canMoveWater[msg.sender],
            "Cannot move to Water"
        );
        require(tile.tileType != TileType.SNOW || canMoveSnow[msg.sender], "Cannot move to Snow");
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

    function addWhitelistedContracts(address[] memory smartContracts) public {
        require(isAdmin[msg.sender], "Not admin");
        for (uint256 i = 0; i < smartContracts.length; i++) {
            checkInterface(smartContracts[i]);
            whitelistedContracts.push(smartContracts[i]);
        }
    }

    function isWhitelisted(address smartContract) internal view returns (bool) {
        for (uint256 i = 0; i < whitelistedContracts.length; i++) {
            if (whitelistedContracts[i] == smartContract) return true;
        }
        return false;
    }

    function ownTile(Coords memory coords, address smartContract)
        public
        isClose(coords)
        isInBounds(coords)
    {
        Tile memory tile = getTile(coords);
        require(
            block.timestamp - tile.lastPurchased > 3 days || tile.owner == msg.sender,
            "Tile already owned"
        );
        require(
            isWhitelisted(smartContract) || canPutAnything[msg.sender],
            "Not whitelisted to put anything"
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

    // Quest Master
    function setQuestMaster(address master) public {
        require(isAdmin[msg.sender], "Not admin");
        questMaster = master;
    }

    function setCanMoveWater(address player, bool canMove) public {
        require(playerInited[player], "Player not inited");
        require(msg.sender == questMaster, "Not quest master");
        canMoveWater[player] = canMove;
        emit PlayerUpdated(player, playerLocation[player]);
    }

    function setCanMoveSnow(address player, bool canMove) public {
        require(playerInited[player], "Player not inited");
        require(msg.sender == questMaster, "Not quest master");
        canMoveSnow[player] = canMove;
        emit PlayerUpdated(player, playerLocation[player]);
    }

    function setCanPutAnything(address player, bool canPut) public {
        require(playerInited[player], "Player not inited");
        require(msg.sender == questMaster, "Not quest master");
        canPutAnything[player] = canPut;
        console.log("canPut", canPut);
        console.log("player", player);
        console.log("val", canPutAnything[player]);
        emit PlayerUpdated(player, playerLocation[player]);
    }
}
