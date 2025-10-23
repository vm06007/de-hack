// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICurvePool {
    function coins(uint256 i) external view returns (address);
}

contract SimplePoolCheck {
    // Curve pool address
    address constant CURVE_POOL = 0x383E6b4437b59fff47B619CBA855CA29342A8559;
    
    // Expected token addresses
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6C3ea9036406852006290770BeDfcAbc0E3ba16C;
    
    function getPoolTokens() public view returns (address, address) {
        ICurvePool pool = ICurvePool(CURVE_POOL);
        return (pool.coins(0), pool.coins(1));
    }
    
    function checkIndices() public view returns (bool, bool) {
        ICurvePool pool = ICurvePool(CURVE_POOL);
        address token0 = pool.coins(0);
        address token1 = pool.coins(1);
        
        // Check if our current indices are correct
        bool isCorrect = (token0 == WETH && token1 == PYUSD);
        bool isSwapped = (token0 == PYUSD && token1 == WETH);
        
        return (isCorrect, isSwapped);
    }
}
