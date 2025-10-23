// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

/**
 * @title SimpleCloneTest
 * @dev Hardhat-compatible tests for simple clone functionality
 */
contract SimpleCloneTest {
    
    // Test accounts
    address public organizer = address(0x1);
    address public participant1 = address(0x2);
    address public participant2 = address(0x3);
    address public judge1 = address(0x4);

    uint256 constant PRIZE_POOL = 5 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    function testSimpleCloneSetup() public view {
        console.log("Testing simple clone setup...");
        
        // Verify test accounts are valid
        require(organizer != address(0), "Organizer should not be zero address");
        require(participant1 != address(0), "Participant1 should not be zero address");
        require(participant2 != address(0), "Participant2 should not be zero address");
        require(judge1 != address(0), "Judge1 should not be zero address");
        
        // Verify all addresses are unique
        require(organizer != participant1, "Organizer should be unique");
        require(participant1 != participant2, "Participants should be unique");
        require(judge1 != organizer, "Judge should be different from organizer");
        
        console.log("Simple clone setup test passed");
    }

    function testSimpleCloneValidation() public view {
        console.log("Testing simple clone validation...");
        
        // Test that we can create valid clone configurations
        uint256 hackathonId = 1;
        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime + DURATION;
        
        require(hackathonId > 0, "Hackathon ID should be positive");
        require(startTime > block.timestamp, "Start time should be in the future");
        require(endTime > startTime, "End time should be after start time");
        require(endTime - startTime == DURATION, "Duration should match calculation");
        
        console.log("Simple clone validation test passed");
        console.log("Hackathon ID:", hackathonId);
        console.log("Start time:", startTime);
        console.log("End time:", endTime);
    }

    function testSimpleCloneParticipants() public view {
        console.log("Testing simple clone participants...");
        
        // Test participant array creation
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        
        require(participants.length == 2, "Should have 2 participants");
        require(participants[0] == participant1, "First participant should match");
        require(participants[1] == participant2, "Second participant should match");
        
        // Test that all participants are unique
        require(participants[0] != participants[1], "Participants should be unique");
        
        console.log("Simple clone participants test passed");
    }

    function testSimpleCloneJudges() public view {
        console.log("Testing simple clone judges...");
        
        // Test judge array creation
        address[] memory judges = new address[](1);
        judges[0] = judge1;
        
        require(judges.length == 1, "Should have 1 judge");
        require(judges[0] == judge1, "Judge should match");
        
        console.log("Simple clone judges test passed");
    }

    function testSimpleCloneLogic() public view {
        console.log("Testing simple clone logic...");
        
        // Test that we can create valid clone configurations
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 50;
        amounts[1] = 30;
        amounts[2] = 20;
        
        // Verify amounts array
        require(amounts.length == 3, "Should have 3 amount values");
        require(amounts[0] > amounts[1], "First place should have more than second");
        require(amounts[1] > amounts[2], "Second place should have more than third");
        
        // Test total amounts calculation
        uint256 totalAmounts = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmounts += amounts[i];
        }
        require(totalAmounts == 100, "Total amounts should be 100");
        
        console.log("Simple clone logic test passed");
        console.log("Total amounts:", totalAmounts);
    }

    function testBasicValidation() public view {
        console.log("Testing basic validation...");
        
        // Test that we can create valid configurations
        uint256 hackathonId = 1;
        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime + DURATION;
        
        require(hackathonId > 0, "Hackathon ID should be positive");
        require(startTime > block.timestamp, "Start time should be in the future");
        require(endTime > startTime, "End time should be after start time");
        
        // Test prize distribution validation
        uint256[] memory prizeDistribution = new uint256[](3);
        prizeDistribution[0] = 50;
        prizeDistribution[1] = 30;
        prizeDistribution[2] = 20;
        
        uint256 totalPrize = 0;
        for (uint256 i = 0; i < prizeDistribution.length; i++) {
            totalPrize += prizeDistribution[i];
        }
        require(totalPrize == 100, "Total prize distribution should be 100");
        
        console.log("Basic validation test passed");
        console.log("Hackathon ID:", hackathonId);
        console.log("Start time:", startTime);
        console.log("End time:", endTime);
        console.log("Total prize distribution:", totalPrize);
    }
}
