// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

contract HackathonFactoryTest is Test {

    HackathonFactory public factory;
    address public organizer;
    address public participant1;
    address public participant2;
    address public participant3;

    uint256 constant PRIZE_POOL = 10 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    event HackathonCreated(
        address indexed hackathonAddress,
        string name,
        address indexed organizer,
        uint256 prizePool
    );

    event ParticipantRegistered(
        address indexed hackathonAddress,
        address indexed participant
    );

    function setUp() public {
        factory = new HackathonFactory();
        organizer = makeAddr("organizer");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        participant3 = makeAddr("participant3");

        // Fund accounts
        vm.deal(organizer, 100 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);
        vm.deal(participant3, 10 ether);
    }

    function testCreateHackathon() public {
        vm.startPrank(organizer);

        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime + DURATION;

        vm.expectEmit(
            false, // Don't check the address (first parameter)
            true,  // Check the name (second parameter)
            false, // Don't check the description (third parameter)
            true   // Check the organizer (fourth parameter)
        );

        emit HackathonCreated(
            address(0), // We can't predict the exact address, but we'll check it's not zero later
            "Web3 Hackathon",
            organizer,
            PRIZE_POOL
        );

        address hackathonAddress = factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            startTime,
            endTime,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );

        vm.stopPrank();

        // Verify hackathon was created
        assertTrue(hackathonAddress != address(0));
        assertEq(factory.getHackathonCount(), 1);

        // Verify hackathon details
        (
            string memory name,
            string memory description,
            uint256 storedStartTime,
            uint256 storedEndTime,
            uint256 prizePool,
            address storedOrganizer,
            bool isActive,
            uint256 participantCount
        ) = factory.getHackathonDetails(hackathonAddress);

        assertEq(name, "Web3 Hackathon");
        assertEq(description, "Build the future of Web3");
        assertEq(storedStartTime, startTime);
        assertEq(storedEndTime, endTime);
        assertEq(prizePool, PRIZE_POOL);
        assertEq(storedOrganizer, organizer);
        assertTrue(isActive);
        assertEq(participantCount, 0);

        // Verify organizer's hackathons
        assertEq(factory.getOrganizerHackathonCount(organizer), 1);
        assertEq(factory.getOrganizerHackathon(organizer, 0), hackathonAddress);
    }

    function testCreateHackathonWithPastStartTimeReverts() public {
        vm.prank(organizer);

        uint256 pastTime = block.timestamp > 1 hours ? block.timestamp - 1 hours : 0;
        uint256 endTime = block.timestamp + DURATION;

        vm.expectRevert("Start time must be in the future");
        factory.createHackathon{value: PRIZE_POOL}(
            "Invalid Hackathon",
            "This should fail",
            pastTime,
            endTime,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );
    }

    function testCreateHackathonWithNoPrizeReverts() public {
        vm.prank(organizer);

        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime + DURATION;

        vm.expectRevert("Prize pool must be greater than 0");
        factory.createHackathon(
            "No Prize Hackathon",
            "This should fail",
            startTime,
            endTime,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );
    }

    function testCreateHackathonWithInvalidEndTimeReverts() public {
        vm.prank(organizer);

        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime - 1; // End before start

        vm.expectRevert("End time must be after start time");
        factory.createHackathon{value: PRIZE_POOL}(
            "Invalid Time Hackathon",
            "This should fail",
            startTime,
            endTime,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );
    }

    function testRegisterForHackathon() public {
        address hackathonAddress = _createDefaultHackathon();

        vm.prank(participant1);

        vm.expectEmit(
            true,
            true,
            false,
            false
        );

        emit ParticipantRegistered(
            hackathonAddress,
            participant1
        );

        factory.registerForHackathon(hackathonAddress);

        // Check participant count increased
        (
            ,
            ,
            ,
            ,
            ,
            ,
            bool isActive,
            uint256 participantCount
        ) = factory.getHackathonDetails(hackathonAddress);

        assertTrue(isActive);
        assertEq(participantCount, 1);

        // Check participant is registered
        assertTrue(factory.isParticipantRegistered(hackathonAddress, participant1));

        // Check participant's hackathons
        assertEq(factory.getParticipantHackathonCount(participant1), 1);
        assertEq(factory.getParticipantHackathon(participant1, 0), hackathonAddress);
    }

    function testRegisterAfterHackathonStartsReverts() public {
        address hackathonAddress = _createDefaultHackathon();

        // Fast forward past start time
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Registration closed - hackathon has started");
        factory.registerForHackathon(hackathonAddress);
    }

    function testRegisterForInactiveHackathonReverts() public {
        address hackathonAddress = _createDefaultHackathon();

        // Make hackathon inactive through emergency withdraw
        vm.prank(organizer);
        Hackathon hackathon = Hackathon(hackathonAddress);
        hackathon.emergencyWithdraw();

        vm.prank(participant1);
        vm.expectRevert("Hackathon is not active");
        factory.registerForHackathon(hackathonAddress);
    }

    function testSubmitProject() public {
        address hackathonAddress = _createDefaultHackathon();

        // Register participant
        vm.prank(participant1);
        factory.registerForHackathon(hackathonAddress);

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        // Submit project directly to hackathon contract
        vm.prank(participant1);
        Hackathon hackathon = Hackathon(hackathonAddress);
        hackathon.submitProject(
            "DeFi Protocol",
            "https://github.com/example/defi"
        );

        // Check submission
        (
            address submitter,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        ) = factory.getSubmission(hackathonAddress, participant1);

        assertEq(submitter, participant1);
        assertEq(projectName, "DeFi Protocol");
        assertEq(projectUrl, "https://github.com/example/defi");
        assertEq(submissionTime, block.timestamp);
        assertEq(score, 0);
    }

    function testSubmitProjectTwiceReverts() public {
        address hackathonAddress = _createDefaultHackathon();

        vm.prank(participant1);
        factory.registerForHackathon(hackathonAddress);

        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.startPrank(participant1);

        Hackathon hackathon = Hackathon(hackathonAddress);
        hackathon.submitProject(
            "First Project",
            "https://first.com"
        );

        // Try to submit again
        vm.expectRevert("Already submitted");
        hackathon.submitProject("Second Project", "https://second.com");

        vm.stopPrank();
    }

    function testSubmitBeforeHackathonStartsReverts() public {
        address hackathonAddress = _createDefaultHackathon();

        vm.prank(participant1);
        factory.registerForHackathon(hackathonAddress);

        // Don't warp time - still before start
        vm.prank(participant1);
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.expectRevert("Hackathon has not started yet");
        hackathon.submitProject("Too Early", "https://early.com");
    }

    function testSubmitAfterHackathonEndsReverts() public {
        address hackathonAddress = _createDefaultHackathon();

        vm.prank(participant1);
        factory.registerForHackathon(hackathonAddress);

        // Warp to after end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.expectRevert("Hackathon has ended");
        hackathon.submitProject("Too Late", "https://late.com");
    }

    function testEmergencyWithdraw() public {
        address hackathonAddress = _createDefaultHackathon();

        uint256 organizerBalanceBefore = organizer.balance;

        vm.prank(organizer);
        Hackathon hackathon = Hackathon(hackathonAddress);
        hackathon.emergencyWithdraw();

        // Check hackathon is inactive and prize pool is 0
        (
            ,
            ,
            ,
            ,
            uint256 prizePool,
            ,
            bool isActive,
        ) = factory.getHackathonDetails(hackathonAddress);

        assertFalse(isActive);
        assertEq(prizePool, 0);

        // Check organizer received funds
        assertEq(
            organizer.balance,
            organizerBalanceBefore + PRIZE_POOL
        );
    }

    function testEmergencyWithdrawNonOrganizerReverts() public {
        address hackathonAddress = _createDefaultHackathon();

        vm.prank(participant1);
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.expectRevert("Only organizer can call this function");
        hackathon.emergencyWithdraw();
    }

    function testDistributePrize() public {
        address hackathonAddress = _createDefaultHackathon();

        // End the hackathon first
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        vm.prank(organizer);
        Hackathon hackathon = Hackathon(hackathonAddress);
        hackathon.endHackathon();

        uint256 winnerBalanceBefore = participant1.balance;
        uint256 prizeAmount = 5 ether;

        vm.prank(organizer);
        hackathon.distributePrize(participant1, prizeAmount);

        // Check winner received funds
        assertEq(participant1.balance, winnerBalanceBefore + prizeAmount);

        // Check prize pool decreased
        (
            ,
            ,
            ,
            ,
            uint256 remainingPrizePool,
            ,
            ,
        ) = factory.getHackathonDetails(hackathonAddress);

        assertEq(remainingPrizePool, PRIZE_POOL - prizeAmount);
    }

    function testMultipleHackathons() public {
        // Create first hackathon
        address hackathon1 = _createDefaultHackathon();

        // Create second hackathon
        vm.prank(participant1);
        address hackathon2 = factory.createHackathon{value: 5 ether}(
            "DeFi Hackathon",
            "Build DeFi protocols",
            block.timestamp + 2 hours,
            block.timestamp + 48 hours,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );

        assertEq(factory.getHackathonCount(), 2);

        // Check both hackathons exist with correct data
        (
            string memory name1,
            ,
            ,
            ,
            ,
            ,
            ,
        ) = factory.getHackathonDetails(hackathon1);

        (
            string memory name2,
            ,
            ,
            ,
            uint256 prize2,
            address org2,
            ,
        ) = factory.getHackathonDetails(hackathon2);

        assertEq(name1, "Web3 Hackathon");
        assertEq(name2, "DeFi Hackathon");
        assertEq(prize2, 5 ether);
        assertEq(org2, participant1);

        // Check organizer's hackathons
        assertEq(factory.getOrganizerHackathonCount(organizer), 1);
        assertEq(factory.getOrganizerHackathon(organizer, 0), hackathon1);
        assertEq(factory.getOrganizerHackathonCount(participant1), 1);
        assertEq(factory.getOrganizerHackathon(participant1, 0), hackathon2);
    }


    // Helper function to create a default hackathon
    function _createDefaultHackathon() internal returns (address) {
        vm.prank(organizer);
        return factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );
    }
}
