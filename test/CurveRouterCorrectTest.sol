// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

interface ICurveRouter {
    function exchange(
        address[11] calldata _route,
        uint256[5][5] calldata _swap_params,
        uint256 _amount,
        uint256 _min_dy,
        address[5] calldata _pools
    ) external payable returns (uint256);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract CurveRouterCorrectTest {
    address constant CURVE_ROUTER = 0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;
    
    function testCorrectCurveRouterParameters() public payable {
        // Send 0.01 ETH to test
        require(msg.value == 0.01 ether, "Must send exactly 0.01 ETH");
        
        // Test the exact parameters from the working transaction
        address[11] memory route = [
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, // ETH
            0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B, // ETH/USDC pool
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
            0x383E6b4437b59fff47B619CBA855CA29342A8559, // USDC/PYUSD pool
            PYUSD,      // PYUSD
            address(0), // Unused
            address(0), // Unused
            address(0), // Unused
            address(0), // Unused
            address(0), // Unused
            address(0)  // Unused
        ];
        
        uint256[5][5] memory swapParams = [
            [uint256(2), uint256(0), uint256(1), uint256(30), uint256(3)], // ETH/USDC: i=2, j=0, swap_type=1, pool_type=30, n_coins=3
            [uint256(1), uint256(0), uint256(1), uint256(10), uint256(2)], // USDC/PYUSD: i=1, j=0, swap_type=1, pool_type=10, n_coins=2
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)], // Unused
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)], // Unused
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]  // Unused
        ];
        
        address[5] memory pools = [
            0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B, // ETH/USDC pool
            0x383E6b4437b59fff47B619CBA855CA29342A8559, // USDC/PYUSD pool
            address(0), // Unused
            address(0), // Unused
            address(0)  // Unused
        ];
        
        uint256 minPyusdOut = 1000000; // Minimum 1 PYUSD (6 decimals)
        
        console.log("Testing Curve router with correct parameters...");
        console.log("ETH amount:", msg.value);
        console.log("Min PYUSD out:", minPyusdOut);
        
        // Record initial PYUSD balance
        uint256 initialPyusdBalance = IERC20(PYUSD).balanceOf(address(this));
        console.log("Initial PYUSD balance:", initialPyusdBalance);
        
        // Execute the swap
        uint256 pyusdReceived = ICurveRouter(CURVE_ROUTER).exchange{
            value: msg.value
        }(
            route,
            swapParams,
            msg.value,
            minPyusdOut,
            pools
        );
        
        // Record final PYUSD balance
        uint256 finalPyusdBalance = IERC20(PYUSD).balanceOf(address(this));
        console.log("Final PYUSD balance:", finalPyusdBalance);
        console.log("PYUSD received from swap:", pyusdReceived);
        
        // Verify we received PYUSD
        require(pyusdReceived > 0, "Should receive PYUSD from swap");
        require(finalPyusdBalance > initialPyusdBalance, "PYUSD balance should increase");
        
        console.log("Curve router test passed!");
    }
}
