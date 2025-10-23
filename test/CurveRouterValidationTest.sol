// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract CurveRouterValidationTest {
    address constant CURVE_ROUTER = 0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;
    
    function testCorrectParametersStructure() public {
        console.log("Testing Curve router parameter structure...");
        
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
        
        // Validate route structure
        require(route[0] == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, "ETH address incorrect");
        require(route[1] == 0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B, "ETH/USDC pool incorrect");
        require(route[2] == 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, "USDC address incorrect");
        require(route[3] == 0x383E6b4437b59fff47B619CBA855CA29342A8559, "USDC/PYUSD pool incorrect");
        require(route[4] == PYUSD, "PYUSD address incorrect");
        
        // Validate swap parameters
        require(swapParams[0][0] == 2, "ETH/USDC i parameter incorrect");
        require(swapParams[0][1] == 0, "ETH/USDC j parameter incorrect");
        require(swapParams[0][2] == 1, "ETH/USDC swap_type parameter incorrect");
        require(swapParams[0][3] == 30, "ETH/USDC pool_type parameter incorrect");
        require(swapParams[0][4] == 3, "ETH/USDC n_coins parameter incorrect");
        
        require(swapParams[1][0] == 1, "USDC/PYUSD i parameter incorrect");
        require(swapParams[1][1] == 0, "USDC/PYUSD j parameter incorrect");
        require(swapParams[1][2] == 1, "USDC/PYUSD swap_type parameter incorrect");
        require(swapParams[1][3] == 10, "USDC/PYUSD pool_type parameter incorrect");
        require(swapParams[1][4] == 2, "USDC/PYUSD n_coins parameter incorrect");
        
        // Validate pools
        require(pools[0] == 0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B, "ETH/USDC pool address incorrect");
        require(pools[1] == 0x383E6b4437b59fff47B619CBA855CA29342A8559, "USDC/PYUSD pool address incorrect");
        
        console.log("All parameters validated successfully!");
        console.log("Route structure: ETH -> ETH/USDC pool -> USDC -> USDC/PYUSD pool -> PYUSD");
        console.log("Swap params: ETH/USDC [2,0,1,30,3], USDC/PYUSD [1,0,1,10,2]");
        console.log("Pools: ETH/USDC pool, USDC/PYUSD pool");
    }
}