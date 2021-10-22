// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./TinyWorld.sol";
import "./Types.sol";

contract TinyWorldGetters is Initializable {
    TinyWorld coreContract;

    function initialize(address _coreContractAddress) public initializer {
        coreContract = TinyWorld(_coreContractAddress);
    }
}
