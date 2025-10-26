// Migrated from Foundry to Hardhat 3.0
// Review and update any Foundry-specific functionality
// Hardhat 3.0 supports native Solidity testing

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "hardhat/test.sol";
import {Counter} from "../contracts/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
        counter.setNumber(0);
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }
}
