// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICurvePool {
    function coins(uint256 i) external view returns (address);
    function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256);
}

contract CurvePoolDebug {
    // Curve pool address
    address constant CURVE_POOL = 0x383E6b4437b59fff47B619CBA855CA29342A8559;
    
    // Expected token addresses
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6C3ea9036406852006290770BeDfcAbc0E3ba16C;
    
    function getPoolTokens() public view returns (address, address) {
        ICurvePool pool = ICurvePool(CURVE_POOL);
        return (pool.coins(0), pool.coins(1));
    }
    
    function testExchangeRates() public view returns (uint256, uint256) {
        ICurvePool pool = ICurvePool(CURVE_POOL);
        
        // Test both directions
        uint256 rate1 = pool.get_dy(0, 1, 1 ether);
        uint256 rate2 = pool.get_dy(1, 0, 1 ether);
        
        return (rate1, rate2);
    }
    
    function getTokenInfo() public view returns (
        address token0,
        address token1,
        bool isWETH0,
        bool isWETH1,
        bool isPYUSD0,
        bool isPYUSD1
    ) {
        ICurvePool pool = ICurvePool(CURVE_POOL);
        token0 = pool.coins(0);
        token1 = pool.coins(1);
        
        isWETH0 = (token0 == WETH);
        isWETH1 = (token1 == WETH);
        isPYUSD0 = (token0 == PYUSD);
        isPYUSD1 = (token1 == PYUSD);
    }
}
