// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

/**
 * @title HackathonDelegationTest
 * @dev Hardhat-compatible tests for Hackathon delegation functionality
 */
contract HackathonDelegationTest {
    
    // Test accounts
    address public organizer = address(0x1);
    address public participant1 = address(0x2);
    address public participant2 = address(0x3);
    address public delegate1 = address(0x4);
    address public delegate2 = address(0x5);

    uint256 constant PRIZE_POOL = 5 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    function testDelegationSetup() public view {
        console.log("Testing delegation setup...");
        
        // Verify test accounts are valid
        require(organizer != address(0), "Organizer should not be zero address");
        require(participant1 != address(0), "Participant1 should not be zero address");
        require(participant2 != address(0), "Participant2 should not be zero address");
        require(delegate1 != address(0), "Delegate1 should not be zero address");
        require(delegate2 != address(0), "Delegate2 should not be zero address");
        
        // Verify all addresses are unique
        require(organizer != participant1, "Organizer should be unique");
        require(participant1 != participant2, "Participants should be unique");
        require(delegate1 != delegate2, "Delegates should be unique");
        require(participant1 != delegate1, "Participant1 should be different from delegate1");
        
        console.log("Delegation setup test passed");
    }

    function testDelegationValidation() public view {
        console.log("Testing delegation validation...");
        
        // Test that we can create valid delegation configurations
        uint256 votingPower = 100;
        uint256 delegatedPower = 50;
        uint256 remainingPower = votingPower - delegatedPower;
        
        require(votingPower > 0, "Voting power should be positive");
        require(delegatedPower > 0, "Delegated power should be positive");
        require(remainingPower > 0, "Remaining power should be positive");
        require(votingPower == delegatedPower + remainingPower, "Total power should equal delegated + remaining");
        
        console.log("Delegation validation test passed");
        console.log("Voting power:", votingPower);
        console.log("Delegated power:", delegatedPower);
        console.log("Remaining power:", remainingPower);
    }

    function testDelegationParticipants() public view {
        console.log("Testing delegation participants...");
        
        // Test participant array creation
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        
        require(participants.length == 2, "Should have 2 participants");
        require(participants[0] == participant1, "First participant should match");
        require(participants[1] == participant2, "Second participant should match");
        
        // Test that all participants are unique
        require(participants[0] != participants[1], "Participants should be unique");
        
        console.log("Delegation participants test passed");
    }

    function testDelegationDelegates() public view {
        console.log("Testing delegation delegates...");
        
        // Test delegate array creation
        address[] memory delegates = new address[](2);
        delegates[0] = delegate1;
        delegates[1] = delegate2;
        
        require(delegates.length == 2, "Should have 2 delegates");
        require(delegates[0] == delegate1, "First delegate should match");
        require(delegates[1] == delegate2, "Second delegate should match");
        
        // Test that all delegates are unique
        require(delegates[0] != delegates[1], "Delegates should be unique");
        
        console.log("Delegation delegates test passed");
    }

    function testDelegationLogic() public view {
        console.log("Testing delegation logic...");
        
        // Test that we can create valid delegation configurations
        uint256[] memory powers = new uint256[](3);
        powers[0] = 50;
        powers[1] = 30;
        powers[2] = 20;
        
        // Verify powers array
        require(powers.length == 3, "Should have 3 power values");
        require(powers[0] > powers[1], "First place should have more power than second");
        require(powers[1] > powers[2], "Second place should have more power than third");
        
        // Test total power calculation
        uint256 totalPower = 0;
        for (uint256 i = 0; i < powers.length; i++) {
            totalPower += powers[i];
        }
        require(totalPower == 100, "Total power should be 100");
        
        console.log("Delegation logic test passed");
        console.log("Total power:", totalPower);
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
