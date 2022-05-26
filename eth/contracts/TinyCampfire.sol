// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./TileContract.sol";
import "./TinyWorld.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

contract TinyCampfire is ITileContract {
    TinyWorld connectedWorld;

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"🏕";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Tiny Campfire";
    }

    function tileDescription(Coords memory coords)
        external
        view
        virtual
        override
        returns (string memory)
    {
        return
            "A Tiny Campfire lets you send and receive smoke signals (messages). You need to be next to one to compose your own message, but you can read others' messages from anywhere.";
    }

    function tileABI(Coords memory coords) external view override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/6d5690378b4d1aeca76e081f5e4c1ab9910ab653/TinyCampfire.json";
    }

    constructor(TinyWorld _connectedWorld) {
        connectedWorld = _connectedWorld;
    }

    struct Message {
        uint256 timestamp;
        address sender;
        string text;
    }

    Message[5] messages;

    function viewMessages() public view returns (string[5] memory) {
        string[5] memory retMessages;
        for (uint256 i = 0; i < 5; i++) {
            string memory delta = StringsUpgradeable.toString(
                (block.timestamp - messages[i].timestamp) / 60
            );
            string memory senderString = StringsUpgradeable.toHexString(
                uint160(messages[i].sender),
                20
            );
            if (messages[i].sender == address(0)) {
                retMessages[i] = "";
            } else {
                retMessages[i] = string(
                    abi.encodePacked(
                        senderString,
                        ": ",
                        messages[i].text,
                        " (",
                        delta,
                        " minutes ago)"
                    )
                );
            }
        }

        return retMessages;
    }

    modifier closeToMyself(Coords memory selfCoords) {
        require(connectedWorld.isPlayerInit(msg.sender), "Not an exgrasia player");
        Coords memory playerLoc = connectedWorld.getPlayerLocation(msg.sender);
        Coords[4] memory neighbors = [
            Coords(playerLoc.x - 1, playerLoc.y),
            Coords(playerLoc.x + 1, playerLoc.y),
            Coords(playerLoc.x, playerLoc.y - 1),
            Coords(playerLoc.x, playerLoc.y + 1)
        ];
        bool closeToSelf = false;
        for (uint256 i = 0; i < neighbors.length; i++) {
            if (
                connectedWorld.getTile(neighbors[i]).smartContract == address(this) &&
                neighbors[i].x == selfCoords.x &&
                neighbors[i].y == selfCoords.y
            ) {
                closeToSelf = true;
            }
        }
        require(closeToSelf, "You need to be next to a campfire to send messages.");
        _;
    }

    function sendMessage(string memory yourMessage, Coords memory selfCoords)
        public
        closeToMyself(selfCoords)
    {
        for (uint256 i = 1; i < 5; i++) {
            messages[i] = messages[i - 1];
        }
        Message memory message = Message(block.timestamp, msg.sender, yourMessage);
        messages[0] = message;
    }
}
