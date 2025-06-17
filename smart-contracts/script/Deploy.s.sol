// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {UserProfile} from "../src/UserProfile.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract UserProfileScript is Script {
    function setUp() public {}

    function run() external returns (UserProfile up, HelperConfig helperConfig) {
        helperConfig = new HelperConfig();
        (uint256 deployerKey) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        up = new UserProfile();
        vm.stopBroadcast();
    }
}
