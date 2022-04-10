// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

abstract contract TinyERC20 is ERC20 {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC20(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0) || to == address(0)) return;
        require(connectedWorld.playerInited(from), "from is not an exgrasia player");
        require(connectedWorld.playerInited(to), "to is not an exgrasia player");
        require(
            connectedWorld.dist(
                connectedWorld.getPlayerLocation(from),
                connectedWorld.getPlayerLocation(to)
            ) <= 1,
            "Players are too far"
        );
    }

    function mint(address to) public virtual;
}

abstract contract TinyERC721 is ERC721Enumerable {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC721(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenID
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenID);
        if (from == address(0) || to == address(0)) return;
        require(connectedWorld.playerInited(from), "from is not an exgrasia player");
        require(connectedWorld.playerInited(to), "to is not an exgrasia player");
        require(
            connectedWorld.dist(
                connectedWorld.getPlayerLocation(from),
                connectedWorld.getPlayerLocation(to)
            ) <= 1,
            "Players are too far"
        );
    }
}
