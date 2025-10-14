// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    event CountIncremented(
        uint256 newCount
    );

    event CountDecremented(
        uint256 newCount
    );

    event CountReset();

    function setUp() public {
        counter = new Counter();
    }

    function testInitialCount()
        public
        view
    {
        assertEq(counter.count(), 0);
        assertEq(counter.get(), 0);
    }

    function testIncrement() public {
        vm.expectEmit(true, false, false, true);
        emit CountIncremented(1);

        counter.increment();

        assertEq(counter.count(), 1);
        assertEq(counter.get(), 1);
    }

    function testMultipleIncrements() public {
        counter.increment();
        counter.increment();
        counter.increment();

        assertEq(counter.count(), 3);
    }

    function testDecrement() public {
        counter.increment();
        counter.increment();

        vm.expectEmit(true, false, false, true);
        emit CountDecremented(1);

        counter.decrement();

        assertEq(counter.count(), 1);
    }

    function testDecrementFromZeroReverts() public {
        vm.expectRevert("Counter cannot be negative!");
        counter.decrement();
    }

    function testDecrementToZero() public {
        counter.increment();

        vm.expectEmit(true, false, false, true);
        emit CountDecremented(0);

        counter.decrement();

        assertEq(counter.count(), 0);
    }

    function testReset() public {
        counter.increment();
        counter.increment();
        counter.increment();

        vm.expectEmit(false, false, false, true);
        emit CountReset();

        counter.reset();

        assertEq(counter.count(), 0);
    }

    function testResetFromZero() public {
        vm.expectEmit(false, false, false, true);
        emit CountReset();

        counter.reset();

        assertEq(counter.count(), 0);
    }

    function testIncrementAfterReset() public {
        counter.increment();
        counter.increment();
        counter.reset();
        counter.increment();

        assertEq(counter.count(), 1);
    }

    function testComplexOperations() public {
        // Increment 5 times
        for (uint i = 0; i < 5; i++) {
            counter.increment();
        }
        assertEq(counter.count(), 5);

        // Decrement 2 times
        counter.decrement();
        counter.decrement();
        assertEq(counter.count(), 3);

        // Reset
        counter.reset();
        assertEq(counter.count(), 0);

        // Increment again
        counter.increment();
        assertEq(counter.count(), 1);
    }

    function testFuzzIncrementDecrement(uint256 increments, uint256 decrements) public {
        vm.assume(increments <= 1000); // Prevent gas issues
        vm.assume(decrements <= increments); // Ensure we don't go negative

        // Increment
        for (uint i = 0; i < increments; i++) {
            counter.increment();
        }
        assertEq(counter.count(), increments);

        // Decrement
        for (uint i = 0; i < decrements; i++) {
            counter.decrement();
        }
        assertEq(counter.count(), increments - decrements);
    }

    function testEvents() public {
        // Test increment event
        vm.expectEmit(true, false, false, true);
        emit CountIncremented(1);
        counter.increment();

        // Test decrement event
        vm.expectEmit(true, false, false, true);
        emit CountDecremented(0);
        counter.decrement();

        // Test reset event
        counter.increment();
        vm.expectEmit(false, false, false, true);
        emit CountReset();
        counter.reset();
    }

    function testGetFunction() public {
        assertEq(counter.get(), 0);

        counter.increment();
        assertEq(counter.get(), 1);

        counter.increment();
        assertEq(counter.get(), 2);

        counter.decrement();
        assertEq(counter.get(), 1);

        counter.reset();
        assertEq(counter.get(), 0);
    }
}

