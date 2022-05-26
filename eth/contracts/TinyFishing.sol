// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "base64-sol/base64.sol";
import "./TileContract.sol";
import "./TinyWorld.sol";
import "./Types.sol";
import "./TinyExtensions.sol";

contract TinyFish is TinyERC721, ReentrancyGuard, ITileContract {
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

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getName(uint256 tokenId) internal view returns (string memory) {
        return pluck(tokenId, "name", fishyNames);
    }

    function getAdjective(uint256 tokenId) internal view returns (string memory) {
        return pluck(tokenId, "adjective", fishyAdjs);
    }

    function getHeight(uint256 tokenId) internal view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("height", toString(tokenId))));
        return string(abi.encodePacked(toString((rand % 50) + 6), " inches"));
    }

    function getWeight(uint256 tokenId) internal view returns (string memory) {
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

    function getTokenDesc(uint256 tokenId) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "Fish #",
                    toString(tokenId),
                    ": A ",
                    getAdjective(tokenId),
                    " ",
                    getName(tokenId),
                    " that's ",
                    getHeight(tokenId),
                    " long and ",
                    getWeight(tokenId),
                    " heavy."
                )
            );
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
        require(connectedWorld.isPlayerInit(msg.sender), "Not an exgrasia player");
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
        require(closeToSelf, "You need to be next to a fishing stand to fish");
        require(closeToWater, "You need to be next to a water tile to fish");
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

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"🎣";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Tiny Fishing Stand";
    }

    function tileDescription(Coords memory coords) external view override returns (string memory) {
        return
            "This is a fishing stand.\nGet started by casting your rod into the nearby waters using castFishingRod.\nThen, you can reel in your fish using reelIn.\nFishes are NFTs so you can also access ERC721 management and authorisation functions at a fishing stand.";
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/3beec6e4a3a3df3f839d1b651474359d0f0de27a/TinyFishing.json";
    }

    constructor(TinyWorld _connectedWorld) TinyERC721("TinyFish", "TINYFISH", _connectedWorld) {
        connectedWorld = _connectedWorld;
        setApprovalForAll(address(this), true);
    }
}

contract TinyOpenSea is ITileContract {
    TinyWorld public connectedWorld;
    TinyFish public tinyFish;

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

    constructor(TinyWorld _connectedWorld, TinyFish _tinyFish) {
        connectedWorld = _connectedWorld;
        tinyFish = _tinyFish;
    }

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"🎏";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Tiny OpenSea Fish Market";
    }

    function tileDescription(Coords memory coords) external view override returns (string memory) {
        return
            "This is a fish market. You can either sell your fish here or buy fishes from other players.";
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/7317d173b8e03e6bc712203c20faba91fbfd177b/TinyOpenSea.json";
    }

    struct Listing {
        uint256 fishID;
        uint256 price;
        uint256 timestamp;
        address seller;
        bool fulfilled;
    }

    Listing[] allListings;
    uint256 activeCount;

    modifier onlyWakingHours() {
        uint256 sinceMidnight = block.timestamp - 1649462400;
        uint256 hourOfDay = (sinceMidnight / 60 / 60) % 24;
        require(
            hourOfDay >= 8 && hourOfDay <= 20,
            "Shopkeeper Tom Nook is taking a nap right now. Come back in a few hours."
        );
        _;
    }

    function getAllListings() public view returns (Listing[] memory) {
        return allListings;
    }

    function getActiveListing() internal view returns (Listing[] memory) {
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < allListings.length; i++) {
            if (allListings[i].fulfilled == false) {
                activeListings[idx] = allListings[i];
                idx += 1;
            }
        }
        return activeListings;
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getPriceAdjective(uint256 tokenID) internal view returns (string memory) {
        uint256 rng = random(
            string(abi.encodePacked("fishAdj", toString(tokenID), uint256(block.timestamp)))
        );
        if (rng % 5 == 0) {
            return "measly";
        } else if (rng % 5 == 1) {
            return "bare";
        } else if (rng % 5 == 2) {
            return "great";
        } else if (rng % 5 == 3) {
            return "steal";
        } else {
            return "low low";
        }
    }

    function viewShop() public view returns (string[] memory) {
        Listing[] memory activeListings = getActiveListing();
        string[] memory shop = new string[](activeListings.length);
        for (uint256 i = 0; i < activeListings.length; i++) {
            string memory fishHRI = tinyFish.getTokenDesc(activeListings[i].fishID);
            shop[i] = string(
                abi.encodePacked(
                    fishHRI,
                    " Available for a ",
                    getPriceAdjective(activeListings[i].fishID),
                    " price of ",
                    toString(activeListings[i].price),
                    "wei."
                )
            );
        }
        return shop;
    }

    function createListing(uint256 fishID, uint256 price) public onlyWakingHours {
        require(
            tinyFish.isApprovedForAll(msg.sender, address(this)),
            "You must approve this contract to access all your fish to create a listing"
        );
        tinyFish.transferFrom(msg.sender, address(this), fishID);
        allListings.push(Listing(fishID, price, block.timestamp, msg.sender, false));
        activeCount += 1;
    }

    function deleteListing(uint256 fishID) public onlyWakingHours {
        for (uint256 i = 0; i < allListings.length; i++) {
            if (allListings[i].fishID == fishID && allListings[i].fulfilled == false) {
                allListings[i].fulfilled = true;
                require(
                    allListings[i].seller == msg.sender,
                    "You can only delete your own listings"
                );
                tinyFish.transferFrom(address(this), msg.sender, fishID);
                activeCount -= 1;
            }
        }
    }

    function buyListing(uint256 fishID) public payable onlyWakingHours {
        for (uint256 i = 0; i < allListings.length; i++) {
            if (allListings[i].fishID == fishID && allListings[i].fulfilled == false) {
                allListings[i].fulfilled = true;
                tinyFish.transferFrom(address(this), msg.sender, fishID);
                (bool success, ) = allListings[i].seller.call{value: allListings[i].price}(
                    new bytes(0)
                );
                require(success, "ETH transfer failed");
                activeCount -= 1;
            }
        }
    }
}
