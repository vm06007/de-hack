// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/DeHackPlatform.sol";

contract DeHackPlatformTest is Test {

    DeHackPlatform public platform;
    address public organizer;
    address public participant1;
    address public participant2;
    address public participant3;

    uint256 constant PRIZE_POOL = 10 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    event HackathonCreated(
        uint256 indexed hackathonId,
        string name,
        address indexed organizer,
        uint256 prizePool
    );

    event ParticipantRegistered(
        uint256 indexed hackathonId,
        address indexed participant
    );

    event SubmissionMade(
        uint256 indexed hackathonId,
        address indexed participant,
        string projectName
    );

    function setUp() public {
        platform = new DeHackPlatform();
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
            true,
            true,
            false,
            true
        );

        emit HackathonCreated(
            1,
            "Web3 Hackathon",
            organizer,
            PRIZE_POOL
        );

        platform.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            startTime,
            endTime
        );

        vm.stopPrank();

        assertEq(platform.hackathonCounter(), 1);

        (
            string memory name,
            string memory description,
            uint256 storedStartTime,
            uint256 storedEndTime,
            uint256 prizePool,
            address storedOrganizer,
            bool isActive,
            uint256 participantCount
        ) = platform.getHackathonDetails(1);

        assertEq(name, "Web3 Hackathon");
        assertEq(description, "Build the future of Web3");
        assertEq(storedStartTime, startTime);
        assertEq(storedEndTime, endTime);
        assertEq(prizePool, PRIZE_POOL);
        assertEq(storedOrganizer, organizer);
        assertTrue(isActive);
        assertEq(participantCount, 0);
    }

    function testCreateHackathonWithPastStartTimeReverts() public {
        // Set block timestamp to a known value
        vm.warp(100000);

        vm.prank(organizer);

        // Use a time in the past
        uint256 pastTime = 50000; // Some time in the past
        uint256 endTime = block.timestamp + DURATION;

        vm.expectRevert("Start time must be in the future");
        platform.createHackathon{value: PRIZE_POOL}(
            "Invalid Hackathon",
            "This should fail",
            pastTime,
            endTime
        );
    }

    function testCreateHackathonWithNoPrizeReverts() public {
        vm.prank(organizer);

        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime + DURATION;

        vm.expectRevert("Prize pool must be greater than 0");
        platform.createHackathon(
            "No Prize Hackathon",
            "This should fail",
            startTime,
            endTime
        );
    }

    function testCreateHackathonWithInvalidEndTimeReverts() public {
        vm.prank(organizer);

        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime - 1; // End before start

        vm.expectRevert("End time must be after start time");
        platform.createHackathon{value: PRIZE_POOL}(
            "Invalid Time Hackathon",
            "This should fail",
            startTime,
            endTime
        );
    }

    function testRegisterForHackathon()
        public
    {
        // Create hackathon first
        _createDefaultHackathon();

        vm.prank(participant1);

        vm.expectEmit(
            true,
            true,
            false,
            false
        );

        emit ParticipantRegistered(
            1,
            participant1
        );

        platform.registerForHackathon(1);

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
        ) = platform.getHackathonDetails(1);

        assertTrue(isActive);
        assertEq(participantCount, 1);

        // Check participant is in the list
        assertEq(
            platform.participants(1, 0),
            participant1
        );
    }

    function testRegisterAfterHackathonStartsReverts()
        public
    {
        _createDefaultHackathon();

        // Fast forward past start time
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Registration closed - hackathon has started");
        platform.registerForHackathon(1);
    }

    function testRegisterForInactiveHackathonReverts()
        public
    {
        _createDefaultHackathon();

        // Make hackathon inactive through emergency withdraw
        vm.prank(organizer);
        platform.emergencyWithdraw(1);

        vm.prank(participant1);
        vm.expectRevert("Hackathon is not active");
        platform.registerForHackathon(1);
    }

    function testSubmitProject()
        public
    {
        _createDefaultHackathon();

        // Register participant
        vm.prank(participant1);
        platform.registerForHackathon(1);

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);

        vm.expectEmit(true, true, false, true);
        emit SubmissionMade(1, participant1, "DeFi Protocol");

        platform.submitProject(
            1,
            "DeFi Protocol",
            "https://github.com/example/defi"
        );

        // Check submission
        (
            address submitter,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score
        ) = platform.submissions(1, participant1);

        assertEq(submitter, participant1);
        assertEq(projectName, "DeFi Protocol");
        assertEq(projectUrl, "https://github.com/example/defi");
        assertEq(submissionTime, block.timestamp);
        assertEq(score, 0);
        assertTrue(platform.hasSubmitted(1, participant1));
    }

    function testSubmitProjectTwiceReverts()
        public
    {
        _createDefaultHackathon();

        vm.prank(participant1);
        platform.registerForHackathon(1);

        vm.warp(
            block.timestamp + START_OFFSET + 1
        );

        vm.startPrank(
            participant1
        );

        platform.submitProject(
            1,
            "First Project",
            "https://first.com"
        );

        // Try to submit again
        vm.expectRevert("Already submitted");
        platform.submitProject(1, "Second Project", "https://second.com");

        vm.stopPrank();
    }

    function testSubmitBeforeHackathonStartsReverts()
        public
    {
        _createDefaultHackathon();

        vm.prank(participant1);
        platform.registerForHackathon(1);

        // Don't warp time - still before start
        vm.prank(participant1);
        vm.expectRevert("Hackathon has not started yet");
        platform.submitProject(1, "Too Early", "https://early.com");
    }

    function testSubmitAfterHackathonEndsReverts()
        public
    {
        _createDefaultHackathon();

        vm.prank(
            participant1
        );

        platform.registerForHackathon(1);

        // Warp to after end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Hackathon has ended");
        platform.submitProject(1, "Too Late", "https://late.com");
    }

    function testEmergencyWithdraw() public {
        _createDefaultHackathon();

        uint256 organizerBalanceBefore = organizer.balance;

        vm.prank(organizer);
        platform.emergencyWithdraw(1);

        // Check hackathon is inactive and prize pool is 0
        (
            ,
            ,
            ,
            ,
            uint256 prizePool
            ,
            ,
            bool isActive
            ,
        ) = platform.getHackathonDetails(1);

        assertFalse(isActive);
        assertEq(prizePool, 0);

        // Check organizer received funds
        assertEq(
            organizer.balance,
            organizerBalanceBefore + PRIZE_POOL
        );
    }

    function testEmergencyWithdrawNonOrganizerReverts() public {
        _createDefaultHackathon();

        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        platform.emergencyWithdraw(1);
    }

    function testEmergencyWithdrawInactiveHackathonReverts() public {
        _createDefaultHackathon();

        vm.startPrank(
            organizer
        );

        platform.emergencyWithdraw(1);

        // Try to withdraw again
        vm.expectRevert("Hackathon is not active");
        platform.emergencyWithdraw(1);
        vm.stopPrank();
    }

    function testMultipleHackathons()
        public
    {
        // Create first hackathon
        _createDefaultHackathon();

        // Create second hackathon
        vm.prank(participant1);
        platform.createHackathon{value: 5 ether}(
            "DeFi Hackathon",
            "Build DeFi protocols",
            block.timestamp + 2 hours,
            block.timestamp + 48 hours
        );

        assertEq(platform.hackathonCounter(), 2);

        // Check both hackathons exist with correct data
        (
            string memory name1
            ,
            ,
            ,
            ,
            ,
            ,
            ,
        ) = platform.getHackathonDetails(1);

        (
            string memory name2
            ,
            ,
            ,
            ,
            uint256 prize2
            ,
            address org2
            ,
            ,
        ) = platform.getHackathonDetails(2);

        assertEq(name1, "Web3 Hackathon");
        assertEq(name2, "DeFi Hackathon");
        assertEq(prize2, 5 ether);
        assertEq(org2, participant1);
    }


    // Helper function to create a default hackathon
    function _createDefaultHackathon()
        internal
    {
        vm.prank(organizer);
        platform.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION
        );
    }
}
