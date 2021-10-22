// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    function initialize(uint256 _seed) public initializer {
        __Ownable_init();
        seed = _seed;
    }
}
