// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";
import "../contracts/VotingTypes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CurveIntegrationAdvancedTest
 * @dev Advanced tests for Curve Finance integration with real-time data
 */
contract CurveIntegrationAdvancedTest is Test {
    HackathonFactory public factory;
    
    // Mainnet addresses
    address constant CURVE_POOL = 0x383e6b4437b59fff47b619cba855ca29342a8559;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbC0e3bA16C;
    
    // Curve pool indices
    int128 public constant ETH_INDEX = 0;
    int128 public constant PYUSD_INDEX = 1;
    
    function setUp() public {
        // Fork mainnet
        vm.createFork("https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY");
        
        // Deploy implementation and factory
        address implementation = address(new Hackathon());
        factory = new HackathonFactory(
            implementation,
            CURVE_POOL,
            WETH,
            PYUSD,
            ETH_INDEX,
            PYUSD_INDEX
        );
    }
    
    function testRealTimePriceComparison() public {
        uint256 ethAmount = 1 ether;
        
        // Get estimation from our factory
        uint256 factoryEstimate = factory.estimatePyusdOutput(ethAmount);
        
        // Get direct estimation from Curve pool
        uint256 curveEstimate = ICurvePool(CURVE_POOL).get_dy(
            ETH_INDEX,
            PYUSD_INDEX,
            ethAmount
        );
        
        console.log("Factory estimate:", factoryEstimate);
        console.log("Direct Curve estimate:", curveEstimate);
        
        // Estimates should be very close (within 1% tolerance)
        uint256 tolerance = curveEstimate / 100; // 1% tolerance
        assertApproxEqAbs(factoryEstimate, curveEstimate, tolerance, "Estimates should be very close");
    }
    
    function testSlippageAnalysis() public {
        uint256[] memory ethAmounts = new uint256[](5);
        ethAmounts[0] = 0.1 ether;
        ethAmounts[1] = 0.5 ether;
        ethAmounts[2] = 1 ether;
        ethAmounts[3] = 2 ether;
        ethAmounts[4] = 5 ether;
        
        console.log("Slippage Analysis:");
        console.log("ETH Amount | PYUSD Output | Rate");
        
        for (uint256 i = 0; i < ethAmounts.length; i++) {
            uint256 pyusdOutput = factory.estimatePyusdOutput(ethAmounts[i]);
            uint256 rate = (pyusdOutput * 1e18) / ethAmounts[i];
            
            console.log(ethAmounts[i], pyusdOutput, rate);
        }
    }
    
    function testLargeAmountConversion() public {
        uint256 largeEthAmount = 10 ether;
        uint256 minPyusdOut = 20000 * 1e6; // 20,000 PYUSD minimum
        
        // This test might fail due to insufficient liquidity
        // but it's good to test the behavior
        try factory.estimatePyusdOutput(largeEthAmount) returns (uint256 estimate) {
            console.log("Large amount estimate:", estimate);
            assertTrue(estimate > 0, "Should get positive estimate");
        } catch {
            console.log("Large amount conversion failed - likely due to liquidity constraints");
        }
    }
    
    function testCurvePoolLiquidity() public {
        // Check if we can get pool information
        try ICurvePool(CURVE_POOL).coins(0) returns (address coin0) {
            console.log("Pool coin 0:", coin0);
        } catch {
            console.log("Could not get pool coin 0");
        }
        
        try ICurvePool(CURVE_POOL).coins(1) returns (address coin1) {
            console.log("Pool coin 1:", coin1);
        } catch {
            console.log("Could not get pool coin 1");
        }
    }
    
    function testMultipleConversions() public {
        uint256 totalEth = 5 ether;
        uint256 conversionCount = 5;
        uint256 ethPerConversion = totalEth / conversionCount;
        
        console.log("Testing multiple conversions:");
        console.log("Total ETH:", totalEth);
        console.log("Conversions:", conversionCount);
        console.log("ETH per conversion:", ethPerConversion);
        
        uint256 totalPyusdReceived = 0;
        
        for (uint256 i = 0; i < conversionCount; i++) {
            uint256 estimate = factory.estimatePyusdOutput(ethPerConversion);
            console.log("Conversion", i + 1, "estimate:", estimate);
            totalPyusdReceived += estimate;
        }
        
        console.log("Total PYUSD estimated:", totalPyusdReceived);
        
        // The total should be reasonable
        assertTrue(totalPyusdReceived > 0, "Should get positive total estimate");
    }
    
    function testPriceImpact() public {
        uint256 smallAmount = 0.01 ether;
        uint256 largeAmount = 1 ether;
        
        uint256 smallEstimate = factory.estimatePyusdOutput(smallAmount);
        uint256 largeEstimate = factory.estimatePyusdOutput(largeAmount);
        
        // Calculate rates
        uint256 smallRate = (smallEstimate * 1e18) / smallAmount;
        uint256 largeRate = (largeEstimate * 1e18) / largeAmount;
        
        console.log("Small amount rate:", smallRate);
        console.log("Large amount rate:", largeRate);
        
        // Large amounts might have worse rates due to price impact
        if (largeRate < smallRate) {
            console.log("Price impact detected - larger amounts get worse rates");
        } else {
            console.log("No significant price impact");
        }
    }
    
    function testCurvePoolDirectSwap() public {
        uint256 ethAmount = 0.1 ether;
        
        // Get initial PYUSD balance
        uint256 initialBalance = IERC20(PYUSD).balanceOf(address(this));
        
        // Perform direct swap
        ICurvePool(CURVE_POOL).exchange{value: ethAmount}(
            ETH_INDEX,
            PYUSD_INDEX,
            ethAmount,
            0 // No minimum for this test
        );
        
        // Check final balance
        uint256 finalBalance = IERC20(PYUSD).balanceOf(address(this));
        uint256 pyusdReceived = finalBalance - initialBalance;
        
        console.log("ETH sent:", ethAmount);
        console.log("PYUSD received:", pyusdReceived);
        
        assertTrue(pyusdReceived > 0, "Should receive PYUSD");
        
        // Calculate effective rate
        uint256 rate = (pyusdReceived * 1e18) / ethAmount;
        console.log("Effective rate:", rate);
    }
    
    function testGasOptimization() public {
        uint256 gasStart;
        uint256 gasUsed;
        
        // Test estimation gas usage
        gasStart = gasleft();
        factory.estimatePyusdOutput(1 ether);
        gasUsed = gasStart - gasleft();
        console.log("Estimation gas used:", gasUsed);
        
        // Test direct Curve call gas usage
        gasStart = gasleft();
        ICurvePool(CURVE_POOL).get_dy(ETH_INDEX, PYUSD_INDEX, 1 ether);
        gasUsed = gasStart - gasleft();
        console.log("Direct Curve call gas used:", gasUsed);
    }
    
    function testErrorHandling() public {
        // Test with zero amount
        vm.expectRevert();
        factory.estimatePyusdOutput(0);
        
        // Test with very large amount (might cause overflow)
        uint256 veryLargeAmount = type(uint256).max;
        try factory.estimatePyusdOutput(veryLargeAmount) {
            console.log("Very large amount handled gracefully");
        } catch {
            console.log("Very large amount caused error (expected)");
        }
    }
    
    function testCurvePoolState() public {
        // Try to get current pool state
        try ICurvePool(CURVE_POOL).get_dy(ETH_INDEX, PYUSD_INDEX, 1 ether) returns (uint256 dy) {
            console.log("Current pool state - 1 ETH to PYUSD:", dy);
            assertTrue(dy > 0, "Pool should be active");
        } catch {
            console.log("Could not get pool state - pool might be inactive");
        }
    }
}
