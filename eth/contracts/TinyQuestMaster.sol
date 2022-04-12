// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TileContract.sol";
import "./TinyFarm.sol";
import "./TinyFishing.sol";
import "./TinyMine.sol";
import "./Types.sol";

contract TinyQuestMaster is ITileContract {
    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"👾";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Tiny Quest Master";
    }

    function tileDescription(Coords memory coords)
        external
        view
        virtual
        override
        returns (string memory)
    {
        return
            "This is the overlord of this world. Please him to gain access to the codex of this world and a boat to sail the oceans.";
    }

    function tileABI(Coords memory coords) external view override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/5c4cf4840febeffedbfa81a7d4052bfe6ec40721/TinyQuestMaster.json";
    }

    struct LevelQuests {
        string levelDescription;
        string[] quests;
    }

    TinyWorld connectedWorld;
    TinyFish fish;
    TinyOpenSea openSea;
    TinyFarm farm;
    TinyWheat wheat;
    TinyCorn corn;
    TinyCactus cactus;
    TinyRanch ranch;
    TinyMilk milk;
    TinyEgg egg;
    TinyMine mine;
    TinyIron iron;
    TinyGold gold;
    TinyDiamond diamond;

    constructor(
        TinyWorld _connectedWorld,
        TinyFish _fish,
        TinyOpenSea _openSea,
        TinyWheat _wheat,
        TinyCorn _corn,
        TinyCactus _cactus,
        TinyRanch _ranch,
        TinyMilk _milk,
        TinyEgg _egg,
        TinyIron _iron,
        TinyGold _gold,
        TinyDiamond _diamond
    ) {
        connectedWorld = _connectedWorld;
        fish = _fish;
        openSea = _openSea;
        wheat = _wheat;
        corn = _corn;
        cactus = _cactus;
        ranch = _ranch;
        milk = _milk;
        egg = _egg;
        iron = _iron;
        gold = _gold;
        diamond = _diamond;
    }

    modifier onlyAdmin() {
        require(connectedWorld.isAdmin(msg.sender), "Only the admin can do this.");
        _;
    }

    function viewQuests() public pure returns (LevelQuests[] memory) {
        LevelQuests[] memory levelQuests = new LevelQuests[](2);
        levelQuests[0]
            .levelDescription = "Level 0 Quests: Finish any one of these to get full access to be able to place your own code in this world.";
        levelQuests[0].quests = new string[](3);
        levelQuests[0].quests[
                0
            ] = "Start your own tiny farm and harvest 5 wheat, 5 corn or 5 cactus tokens. Use the farmingLevel0() function to verify completion.";
        levelQuests[0].quests[
                1
            ] = "Fish at a tiny fishing stand and obtain at least 3 different fish. Use the fishingLevel0() function to verify completion.";
        levelQuests[0].quests[
                2
            ] = "Mine at a tiny mine and mine atleast 5 iron. Use the miningLevel0() function to verify completion.";

        levelQuests[1]
            .levelDescription = "Level 1 Quests: Finish any one of these to get a boat - a boat allows you to traverse water/snow tiles.";
        levelQuests[1].quests = new string[](2);
        levelQuests[1].quests[
                0
            ] = "Start your own ranch, own at least 5 gallons of milk or eggs and 5 animals in your ranch. Use the farmingLevel1() function to verify completion.";
        levelQuests[1].quests[
                1
            ] = "Put up at least 5 fish for sale in a tiny fish market. Use the fishingLevel1() function to verify completion.";

        return levelQuests;
    }

    function farmingLevel0() public {
        require(
            wheat.balanceOf(msg.sender) >= 5 * 10**18 ||
                corn.balanceOf(msg.sender) >= 5 * 10**18 ||
                cactus.balanceOf(msg.sender) >= 5 * 10**18,
            "You need to harvest at least 5 wheat, 5 corn or 5 cactus tokens to complete this quest."
        );
        connectedWorld.setCanPutAnything(msg.sender, true);
    }

    function fishingLevel0() public {
        require(
            fish.balanceOf(msg.sender) >= 3,
            "You need to fish at least 3 different fish to complete this quest."
        );
        connectedWorld.setCanPutAnything(msg.sender, true);
    }

    function miningLevel0() public {
        require(
            iron.balanceOf(msg.sender) >= 5 * 10**18,
            "You need to mine at least 5 iron to complete this quest."
        );
        connectedWorld.setCanPutAnything(msg.sender, true);
    }

    function farmingLevel1() public {
        require(
            milk.balanceOf(msg.sender) + egg.balanceOf(msg.sender) >= 5 * 10**18,
            "You need to harvest at least 5 wheat, 5 corn, 5 cactus, 5 milk or 5 eggs to complete this quest."
        );
        Tile[] memory touchedTiles = connectedWorld.getTouchedTiles();
        uint256 ownedAnimals = 0;
        for (uint256 i = 0; i < touchedTiles.length; i++) {
            if (
                touchedTiles[i].owner == msg.sender &&
                touchedTiles[i].smartContract == address(ranch)
            ) {
                ownedAnimals += ranch.currentPopulation(touchedTiles[i].coords);
            }
        }
        require(
            ownedAnimals >= 5,
            "You need to own at least 5 cows/chickens to complete this quest."
        );
        connectedWorld.setCanMoveSnow(msg.sender, true);
        connectedWorld.setCanMoveWater(msg.sender, true);
    }

    function fishingLevel1() public {
        uint256 count = 0;

        TinyOpenSea.Listing[] memory listings = openSea.getAllListings();
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].seller == msg.sender) {
                count++;
            }
        }
        require(count >= 5, "You need to list at least 5 fish for sale to complete this quest.");
        connectedWorld.setCanMoveSnow(msg.sender, true);
        connectedWorld.setCanMoveWater(msg.sender, true);
    }
}
