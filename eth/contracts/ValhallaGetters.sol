// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Valhalla.sol";
import "./Types.sol";

contract ValhallaGetters is Initializable {
    address adminAddress;
    Valhalla coreContract;

    function initialize(address _adminAddress, address _coreContractAddress) public initializer {
        adminAddress = _adminAddress;
        coreContract = Valhalla(_coreContractAddress);
    }
}
