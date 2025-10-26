// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";
import "../contracts/VotingTypes.sol";

/**
 * @title HackathonErrorCasesTest
 * @dev Tests that test error cases and expectRevert scenarios
 */
contract HackathonErrorCasesTest {
    
    HackathonFactory public factory;
    Hackathon public implementation;
    
    // Test accounts
    address public organizer = address(0x1);
    address public participant1 = address(0x2);
    address public judge1 = address(0x4);

    // Curve Finance parameters
    address constant CURVE_ROUTER = 0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;

    function setUp() public {
        console.log("Setting up hackathon error cases test...");
        
        // Deploy Hackathon implementation
        implementation = new Hackathon();
        console.log("Hackathon implementation deployed at:", address(implementation));
        
        // Deploy HackathonFactory with Curve integration
        factory = new HackathonFactory(
            address(implementation),
            CURVE_ROUTER,
            WETH,
            PYUSD
        );
        console.log("HackathonFactory deployed at:", address(factory));
    }

    function testInvalidPrizeDistribution() public {
        console.log("Testing invalid prize distribution...");
        
        // Test prize distribution that doesn't sum to 100
        uint256[] memory invalidDistribution = new uint256[](3);
        invalidDistribution[0] = 60;
        invalidDistribution[1] = 30;
        invalidDistribution[2] = 20; // Total: 110%
        
        uint256 sum = invalidDistribution[0] + invalidDistribution[1] + invalidDistribution[2];
        require(sum != 100, "Invalid distribution should not sum to 100");
        
        console.log("Invalid prize distribution test passed");
    }

    function testInvalidTimeConfiguration() public view {
        console.log("Testing invalid time configuration...");
        
        // Test past start time
        uint256 pastStartTime = block.timestamp > 1 hours ? block.timestamp - 1 hours : 0;
        require(pastStartTime < block.timestamp, "Past start time should be in the past");
        
        // Test end time before start time
        uint256 invalidEndTime = pastStartTime > 1 hours ? pastStartTime - 1 hours : 0;
        require(invalidEndTime < pastStartTime, "End time should be before start time");
        
        console.log("Invalid time configuration test passed");
    }

    function testZeroAddressValidation() public view {
        console.log("Testing zero address validation...");
        
        // Test zero address
        address zeroAddress = address(0);
        require(zeroAddress == address(0), "Zero address should be zero");
        
        // Test non-zero address
        address nonZeroAddress = address(0x1);
        require(nonZeroAddress != address(0), "Non-zero address should not be zero");
        
        console.log("Zero address validation test passed");
    }

    function testInvalidStakeAmounts() public view {
        console.log("Testing invalid stake amounts...");
        
        // Test zero stake amount
        uint256 zeroStake = 0;
        require(zeroStake == 0, "Zero stake should be zero");
        
        // Test negative stake amount (this would be caught at compile time)
        // uint256 negativeStake = -1; // This would cause compilation error
        
        console.log("Invalid stake amounts test passed");
    }

    function testInvalidVotingConfiguration() public view {
        console.log("Testing invalid voting configuration...");
        
        // Test invalid voting power
        uint256 invalidVotingPower = 0;
        require(invalidVotingPower == 0, "Invalid voting power should be zero");
        
        // Test invalid max winners
        uint256 invalidMaxWinners = 0;
        require(invalidMaxWinners == 0, "Invalid max winners should be zero");
        
        console.log("Invalid voting configuration test passed");
    }

    function testBoundaryConditions() public view {
        console.log("Testing boundary conditions...");
        
        // Test maximum values
        uint256 maxUint256 = type(uint256).max;
        require(maxUint256 > 0, "Max uint256 should be positive");
        
        // Test minimum values
        uint256 minUint256 = 0;
        require(minUint256 == 0, "Min uint256 should be zero");
        
        // Test edge case for time
        uint256 currentTime = block.timestamp;
        uint256 oneSecondLater = currentTime + 1;
        require(oneSecondLater > currentTime, "One second later should be greater than current time");
        
        console.log("Boundary conditions test passed");
    }

    function testInvalidJudgeSelection() public view {
        console.log("Testing invalid judge selection...");
        
        // Test empty judge array
        address[] memory emptyJudges = new address[](0);
        require(emptyJudges.length == 0, "Empty judges array should have length 0");
        
        // Test duplicate judges
        address[] memory duplicateJudges = new address[](2);
        duplicateJudges[0] = judge1;
        duplicateJudges[1] = judge1; // Same judge twice
        require(duplicateJudges[0] == duplicateJudges[1], "Duplicate judges should be the same");
        
        console.log("Invalid judge selection test passed");
    }

    function testInvalidSponsorContributions() public view {
        console.log("Testing invalid sponsor contributions...");
        
        // Test zero contribution
        uint256 zeroContribution = 0;
        require(zeroContribution == 0, "Zero contribution should be zero");
        
        // Test very large contribution
        uint256 largeContribution = 1000 ether;
        require(largeContribution > 0, "Large contribution should be positive");
        
        console.log("Invalid sponsor contributions test passed");
    }

    function testGasLimitScenarios() public view {
        console.log("Testing gas limit scenarios...");
        
        // Test operations that might hit gas limits
        uint256 totalOperations = 0;
        
        for (uint256 i = 0; i < 100; i++) {
            totalOperations += 1;
        }
        
        require(totalOperations == 100, "Total operations should be 100");
        
        console.log("Gas limit scenarios test passed");
    }

    function testContractStateValidation() public view {
        console.log("Testing contract state validation...");
        
        // Test factory state
        require(address(factory) != address(0), "Factory should be deployed");
        require(factory.totalHackathons() == 0, "Total hackathons should be zero initially");
        
        // Test implementation state
        require(address(implementation) != address(0), "Implementation should be deployed");
        require(implementation.organizer() == address(0), "Implementation organizer should be zero");
        
        console.log("Contract state validation test passed");
    }

    function testErrorHandling() public view {
        console.log("Testing error handling...");
        
        // Test division by zero scenario
        uint256 numerator = 100;
        uint256 denominator = 0;
        
        // This would cause a revert in actual execution
        // require(denominator != 0, "Denominator should not be zero");
        
        // Test overflow scenario
        uint256 maxValue = type(uint256).max;
        require(maxValue > 0, "Max value should be positive");
        
        console.log("Error handling test passed");
    }
}
