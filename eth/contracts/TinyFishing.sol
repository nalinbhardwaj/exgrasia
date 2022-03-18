// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "base64-sol/base64.sol";
import "./TileContract.sol";
import "./TinyWorld.sol";
import "./Types.sol";

contract TinyFish is ERC721Enumerable, ReentrancyGuard, ITileContract {
    using Counters for Counters.Counter;

    string[] private fishyNames = [
        "Anchovy",
        "Angelfish",
        "Arapaima",
        "Arowana",
        "Barred Knifejaw",
        "Barreleye",
        "Betta",
        "Bitterling",
        "Black Bass",
        "Blowfish",
        "Blue Marlin",
        "Bluegill",
        "Butterfly Fish",
        "Carp",
        "Catfish",
        "Char",
        "Cherry Salmon",
        "Clown Fish",
        "Coelacanth",
        "Crawfish",
        "Crucian Carp",
        "Dab",
        "Dace",
        "Dorado",
        "Football Fish",
        "Freshwater Goby",
        "Frog",
        "Gar",
        "Giant Snakehead",
        "Giant Trevally",
        "Golden Trout",
        "Goldfish",
        "Great White Shark",
        "Guppy",
        "Hammerhead Shark",
        "Horse Mackerel",
        "Killifish",
        "King Salmon",
        "Koi",
        "Loach",
        "Mahi-Mahi",
        "Mitten Crab",
        "Moray Eel",
        "Napoleonfish",
        "Neon Tetra",
        "Nibble Fish",
        "Oarfish",
        "Ocean Sunfish",
        "Olive Flounder",
        "Pale Chub",
        "Pike",
        "Piranha",
        "Pond Smelt",
        "Pop-eyed Goldfish",
        "Puffer Fish",
        "Rainbowfish",
        "Ranchu Goldfish",
        "Ray",
        "Red Snapper",
        "Ribbon Eel",
        "Saddled Bichir",
        "Salmon",
        "Saw Shark",
        "Sea Bass",
        "Sea Butterfly",
        "Sea Horse",
        "Snapping Turtle",
        "Soft-shelled Turtle",
        "Squid",
        "Stringfish",
        "Sturgeon",
        "Suckerfish",
        "Surgeonfish",
        "Sweetfish",
        "Tadpole",
        "Tilapia",
        "Tuna",
        "Whale Shark",
        "Yellow Perch",
        "Zebra Turkeyfish"
    ];

    string[] private fishyAdjs = [
        "Slippery",
        "Scaly",
        "Luminescent",
        "Shiny",
        "Delicious",
        "Crispy",
        "Golden",
        "Juicy",
        "Battered",
        "Smelly",
        "Salty",
        "Slimy",
        "Foul-smelling",
        "Iridescent",
        "White-bellied",
        "Gullible",
        "Fickle",
        "Curious",
        "Finned",
        "Bony"
    ];

    Counters.Counter private tokenCounter;
    uint256[] public currentPool;
    mapping(address => uint256) public previousCast;
    TinyWorld public connectedWorld;

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getName(uint256 tokenId) public view returns (string memory) {
        return pluck(tokenId, "name", fishyNames);
    }

    function getAdjective(uint256 tokenId) public view returns (string memory) {
        return pluck(tokenId, "adjective", fishyAdjs);
    }

    function getHeight(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("height", toString(tokenId))));
        return string(abi.encodePacked(toString((rand % 50) + 6), " inches"));
    }

    function getWeight(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("weight", toString(tokenId))));
        return string(abi.encodePacked(toString(50 + (rand % 100)), " lbs"));
    }

    function pluck(
        uint256 tokenId,
        string memory keyPrefix,
        string[] memory sourceArray
    ) internal view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked(keyPrefix, toString(tokenId))));
        string memory output = sourceArray[rand % sourceArray.length];
        return output;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string[9] memory parts;
        parts[
            0
        ] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        parts[1] = getName(tokenId);

        parts[2] = '</text><text x="10" y="40" class="base">';

        parts[3] = getAdjective(tokenId);

        parts[4] = '</text><text x="10" y="60" class="base">';

        parts[5] = getHeight(tokenId);

        parts[6] = '</text><text x="10" y="80" class="base">';

        parts[7] = getWeight(tokenId);

        parts[8] = "</text></svg>";

        string memory output = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6],
                parts[7],
                parts[8]
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        getName(tokenId),
                        " #",
                        toString(tokenId),
                        '", "adjective": "',
                        getAdjective(tokenId),
                        '", "height": "',
                        getHeight(tokenId),
                        '", "weight": "',
                        getWeight(tokenId),
                        '", "description": "TinyFish are fishes inside the exgrasia universe. Stats, images, and other functionality are intentionally omitted for others to interpret. Feel free to use these in any way you want. Inspired by Loot.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '"}'
                    )
                )
            )
        );
        output = string(abi.encodePacked("data:application/json;base64,", json));

        return output;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function burnPoolFish(uint256 idx) internal {
        require(idx < currentPool.length);
        currentPool[idx] = currentPool[currentPool.length - 1];
        currentPool.pop();
    }

    function mintFishToPool() private {
        tokenCounter.increment();
        currentPool.push(tokenCounter.current());
    }

    modifier closeToSelfAndWater() {
        require(connectedWorld.playerInited(msg.sender), "Not an exgrasia player");
        Coords memory playerLoc = connectedWorld.getPlayerLocation(msg.sender);
        Coords[4] memory neighbors = [
            Coords(playerLoc.x - 1, playerLoc.y),
            Coords(playerLoc.x + 1, playerLoc.y),
            Coords(playerLoc.x, playerLoc.y - 1),
            Coords(playerLoc.x, playerLoc.y + 1)
        ];
        bool closeToSelf = false;
        bool closeToWater = false;
        for (uint256 i = 0; i < neighbors.length; i++) {
            if (connectedWorld.getTile(neighbors[i]).smartContract == address(this)) {
                closeToSelf = true;
            }
            if (connectedWorld.getTile(neighbors[i]).tileType == TileType.WATER) {
                closeToWater = true;
            }
        }
        require(closeToSelf, "You need to next to the fishing tile to cast");
        require(closeToWater, "You need to next to a water tile to cast");
        _;
    }

    function castFishingRod() public nonReentrant closeToSelfAndWater {
        // maintain a pool of ~1.2 fish per cast in expectation
        mintFishToPool();
        if (uint256(blockhash(block.number - 1)) % 100 < 20) {
            mintFishToPool();
        }
        previousCast[msg.sender] = block.timestamp;
    }

    function reelIn() public nonReentrant closeToSelfAndWater {
        require(currentPool.length > 0, "No fish in the pool");
        require(
            previousCast[msg.sender] != 0 && previousCast[msg.sender] + 5 < block.timestamp,
            "You must wait 5 seconds between casting and reeling in."
        );
        previousCast[msg.sender] = 0;
        uint256 randFish = random(
            string(
                abi.encodePacked(
                    "fishy",
                    toString(block.timestamp),
                    toString(uint256(uint160(msg.sender)))
                )
            )
        ) % currentPool.length;

        console.log(currentPool[randFish]);
        _mint(msg.sender, currentPool[randFish]);
        burnPoolFish(randFish);
    }

    function tileEmoji() external view override returns (string memory) {
        return unicode"🐠";
    }

    function tileName() external view override returns (string memory) {
        return "Tiny Fishing";
    }

    function tileDescription() external view override returns (string memory) {
        return "This is a fishing test";
    }

    function tileABI() external view virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/d09538a21e918ef2e629de05e025f4e16f65ec39/TinyFishing.json";
    }

    constructor(TinyWorld _connectedWorld) ERC721("TinyFish", "TINYFISH") {
        connectedWorld = _connectedWorld;
        setApprovalForAll(address(this), true);
    }
}
