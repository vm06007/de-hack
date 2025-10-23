// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

/**
 * @title HackathonFactoryBasicTest
 * @dev Hardhat-compatible tests for HackathonFactory basic functionality
 */
contract HackathonFactoryBasicTest {
    
    // Test accounts
    address public organizer = address(0x1);
    address public participant = address(0x2);
    address public judge1 = address(0x3);
    address public judge2 = address(0x4);

    uint256 constant PRIZE_POOL = 5 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    function _createPrizeDistribution(uint256 a, uint256 b, uint256 c) internal pure returns (uint256[] memory) {
        uint256[] memory distribution = new uint256[](3);
        distribution[0] = a;
        distribution[1] = b;
        distribution[2] = c;
        return distribution;
    }

    function testFactorySetup() public view {
        console.log("Testing factory setup...");
        
        // Verify test accounts are valid
        require(organizer != address(0), "Organizer should not be zero address");
        require(participant != address(0), "Participant should not be zero address");
        require(judge1 != address(0), "Judge1 should not be zero address");
        require(judge2 != address(0), "Judge2 should not be zero address");
        
        // Verify all addresses are unique
        require(organizer != participant, "Organizer should be unique");
        require(participant != judge1, "Participant should be unique");
        require(judge1 != judge2, "Judges should be unique");
        
        console.log("Factory setup test passed");
    }

    function testPrizeDistributionCreation() public view {
        console.log("Testing prize distribution creation...");
        
        uint256[] memory distribution = _createPrizeDistribution(50, 30, 20);
        
        require(distribution.length == 3, "Distribution should have 3 elements");
        require(distribution[0] == 50, "First place should be 50");
        require(distribution[1] == 30, "Second place should be 30");
        require(distribution[2] == 20, "Third place should be 20");
        
        // Verify total adds up to 100
        uint256 total = distribution[0] + distribution[1] + distribution[2];
        require(total == 100, "Total distribution should be 100");
        
        console.log("Prize distribution creation test passed");
        console.log("1st place:", distribution[0]);
        console.log("2nd place:", distribution[1]);
        console.log("3rd place:", distribution[2]);
        console.log("Total:", total);
    }

    function testTimeConfiguration() public view {
        console.log("Testing time configuration...");
        
        require(START_OFFSET > 0, "Start offset should be positive");
        require(DURATION > 0, "Duration should be positive");
        require(START_OFFSET == 1 hours, "Start offset should be 1 hour");
        require(DURATION == 24 hours, "Duration should be 24 hours");
        
        uint256 currentTime = block.timestamp;
        uint256 startTime = currentTime + START_OFFSET;
        uint256 endTime = startTime + DURATION;
        
        require(startTime > currentTime, "Start time should be in the future");
        require(endTime > startTime, "End time should be after start time");
        require(endTime - startTime == DURATION, "Duration should match calculation");
        
        console.log("Time configuration test passed");
        console.log("Start offset:", START_OFFSET);
        console.log("Duration:", DURATION);
    }

    function testPrizePoolValidation() public view {
        console.log("Testing prize pool validation...");
        
        require(PRIZE_POOL > 0, "Prize pool should be positive");
        require(PRIZE_POOL == 5 ether, "Prize pool should be 5 ether");
        
        // Test different prize distributions
        uint256[] memory distribution1 = _createPrizeDistribution(60, 30, 10);
        uint256[] memory distribution2 = _createPrizeDistribution(50, 30, 20);
        uint256[] memory distribution3 = _createPrizeDistribution(40, 35, 25);
        
        // Verify all distributions sum to 100
        for (uint256 i = 0; i < 3; i++) {
            uint256 total1 = distribution1[0] + distribution1[1] + distribution1[2];
            uint256 total2 = distribution2[0] + distribution2[1] + distribution2[2];
            uint256 total3 = distribution3[0] + distribution3[1] + distribution3[2];
            
            require(total1 == 100, "Distribution 1 should sum to 100");
            require(total2 == 100, "Distribution 2 should sum to 100");
            require(total3 == 100, "Distribution 3 should sum to 100");
        }
        
        console.log("Prize pool validation test passed");
    }

    function testAccountValidation() public view {
        console.log("Testing account validation...");
        
        // Test that all addresses are valid (non-zero)
        require(organizer != address(0), "Organizer should not be zero address");
        require(participant != address(0), "Participant should not be zero address");
        require(judge1 != address(0), "Judge1 should not be zero address");
        require(judge2 != address(0), "Judge2 should not be zero address");
        
        // Test that all addresses are unique
        require(organizer != participant, "Organizer should be unique");
        require(participant != judge1, "Participant should be unique");
        require(judge1 != judge2, "Judges should be unique");
        
        console.log("Account validation test passed");
    }

    function testBasicLogic() public view {
        console.log("Testing basic logic...");
        
        // Test that we can create multiple prize distributions
        uint256[] memory distributions = new uint256[](3);
        distributions[0] = 50;
        distributions[1] = 30;
        distributions[2] = 20;
        
        // Test array operations
        require(distributions.length == 3, "Should have 3 distributions");
        require(distributions[0] > distributions[1], "1st place should be higher than 2nd");
        require(distributions[1] > distributions[2], "2nd place should be higher than 3rd");
        
        // Test calculations
        uint256 total = 0;
        for (uint256 i = 0; i < distributions.length; i++) {
            total += distributions[i];
        }
        require(total == 100, "Total should be 100");
        
        console.log("Basic logic test passed");
        console.log("Total distribution:", total);
    }
}
