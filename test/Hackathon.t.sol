// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";

contract HackathonTest is Test {

    Hackathon public hackathon;
    address public organizer;
    address public participant1;
    address public participant2;
    address public participant3;

    uint256 constant PRIZE_POOL = 10 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    event ParticipantRegistered(
        address indexed participant
    );

    event SubmissionMade(
        address indexed participant,
        string projectName
    );

    event PrizeDistributed(
        address indexed winner,
        uint256 amount
    );

    event HackathonEnded();

    function setUp()
        public
    {
        organizer = makeAddr("organizer");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        participant3 = makeAddr("participant3");

        // Fund accounts
        vm.deal(organizer, 100 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);
        vm.deal(participant3, 10 ether);

        // Deploy hackathon contract
        vm.prank(organizer);
        hackathon = new Hackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            organizer,
            1 ether // minimum sponsor contribution
        );
    }

    function testHackathonInitialization()
        public
        view
    {
        (
            string memory name,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 prizePool,
            address storedOrganizer,
            bool isActive,
            uint256 participantCount
        ) = hackathon.getHackathonDetails();

        assertEq(
            name,
            "Web3 Hackathon"
        );

        assertEq(
            description,
            "Build the future of Web3"
        );

        assertEq(
            startTime,
            block.timestamp + START_OFFSET
        );

        assertEq(
            endTime,
            block.timestamp + START_OFFSET + DURATION
        );

        assertEq(
            prizePool,
            PRIZE_POOL
        );

        assertEq(
            storedOrganizer,
            organizer
        );

        assertTrue(
            isActive
        );

        assertEq(
            participantCount,
            0
        );
    }

    function testRegisterParticipant() public {
        vm.prank(participant1);

        vm.expectEmit(true, false, false, false);
        emit ParticipantRegistered(participant1);

        hackathon.register();

        assertTrue(
            hackathon.isRegistered(participant1)
        );

        assertEq(
            hackathon.participantCount(),
            1
        );
    }

    function testRegisterTwiceReverts() public {
        vm.startPrank(participant1);

        hackathon.register();

        vm.expectRevert("Already registered");
        hackathon.register();

        vm.stopPrank();
    }

    function testRegisterAfterStartReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Registration closed - hackathon has started");
        hackathon.register();
    }

    function testSubmitProject() public {
        // Register participant first
        vm.prank(participant1);
        hackathon.register();

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);

        vm.expectEmit(true, false, false, true);
        emit SubmissionMade(participant1, "DeFi Protocol");

        hackathon.submitProject("DeFi Protocol", "https://github.com/example/defi");

        assertTrue(
            hackathon.hasSubmitted(participant1)
        );

        (
            address submitter,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        ) = hackathon.getSubmission(participant1);

        assertEq(
            submitter,
            participant1
        );

        assertEq(
            projectName,
            "DeFi Protocol"
        );

        assertEq(
            projectUrl,
            "https://github.com/example/defi"
        );

        assertEq(
            submissionTime,
            block.timestamp
        );

        assertEq(
            score,
            0
        );
    }

    function testSubmitProjectNotRegisteredReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Not registered for this hackathon");
        hackathon.submitProject("DeFi Protocol", "https://github.com/example/defi");
    }

    function testSubmitProjectTwiceReverts() public {
        vm.prank(participant1);
        hackathon.register();

        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.startPrank(participant1);

        hackathon.submitProject("First Project", "https://first.com");

        vm.expectRevert("Already submitted");
        hackathon.submitProject("Second Project", "https://second.com");

        vm.stopPrank();
    }

    function testSubmitBeforeStartReverts() public {
        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant1);
        vm.expectRevert("Hackathon has not started yet");
        hackathon.submitProject("Too Early", "https://early.com");
    }

    function testSubmitAfterEndReverts() public {
        vm.prank(participant1);
        hackathon.register();

        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Hackathon has ended");
        hackathon.submitProject("Too Late", "https://late.com");
    }

    function testDistributePrize() public {
        // End the hackathon first
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        vm.prank(organizer);
        hackathon.endHackathon();

        uint256 winnerBalanceBefore = participant1.balance;
        uint256 prizeAmount = 5 ether;

        vm.prank(organizer);

        vm.expectEmit(true, false, false, true);
        emit PrizeDistributed(participant1, prizeAmount);

        hackathon.distributePrize(participant1, prizeAmount);

        // Check winner received funds
        assertEq(
            participant1.balance,
            winnerBalanceBefore + prizeAmount
        );

        // Check prize pool decreased
        assertEq(
            hackathon.prizePool(),
            PRIZE_POOL - prizeAmount
        );
    }

    function testDistributePrizeNonOrganizerReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Only organizer or sponsors can distribute prizes");
        hackathon.distributePrize(participant1, 5 ether);
    }

    function testDistributePrizeTooMuchReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Amount exceeds prize pool");
        hackathon.distributePrize(participant1, PRIZE_POOL + 1);
    }

    function testDistributePrizeZeroAmountReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Amount must be greater than 0");
        hackathon.distributePrize(participant1, 0);
    }

    function testDistributePrizeWhileActiveReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(organizer);
        vm.expectRevert("Hackathon is still active");
        hackathon.distributePrize(participant1, 5 ether);
    }

    function testEmergencyWithdraw() public {
        uint256 organizerBalanceBefore = organizer.balance;

        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        // Check hackathon is inactive and prize pool is 0
        assertFalse(
            hackathon.isActive()
        );

        assertEq(
            hackathon.prizePool(),
            0
        );

        // Check organizer received funds
        assertEq(
            organizer.balance,
            organizerBalanceBefore + PRIZE_POOL
        );
    }

    function testEmergencyWithdrawNonOrganizerReverts() public {
        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.emergencyWithdraw();
    }

    function testEmergencyWithdrawInactiveHackathonReverts() public {
        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        vm.prank(organizer);
        vm.expectRevert("Hackathon is not active");
        hackathon.emergencyWithdraw();
    }

    function testEndHackathon() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);

        vm.expectEmit(false, false, false, false);
        emit HackathonEnded();

        hackathon.endHackathon();

        assertFalse(
            hackathon.isActive()
        );
    }

    function testEndHackathonNonOrganizerReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.endHackathon();
    }

    function testEndHackathonBeforeEndTimeReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(organizer);
        vm.expectRevert("Hackathon has not ended yet");
        hackathon.endHackathon();
    }

    function testEndHackathonAlreadyInactiveReverts() public {
        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Hackathon is not active");
        hackathon.endHackathon();
    }

    function testIsRegistrationOpen() public {
        // Before start time
        assertTrue(
            hackathon.isRegistrationOpen()
        );

        // After start time
        vm.warp(block.timestamp + START_OFFSET + 1);
        assertFalse(
            hackathon.isRegistrationOpen()
        );

        // After end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        assertFalse(
            hackathon.isRegistrationOpen()
        );
    }

    function testIsSubmissionOpen() public {
        // Before start time
        assertFalse(
            hackathon.isSubmissionOpen()
        );

        // During hackathon
        vm.warp(block.timestamp + START_OFFSET + 1);
        assertTrue(
            hackathon.isSubmissionOpen()
        );

        // After end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        assertFalse(
            hackathon.isSubmissionOpen()
        );
    }

    function testMultipleParticipants() public {
        // Register multiple participants
        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant2);
        hackathon.register();

        vm.prank(participant3);
        hackathon.register();

        assertEq(
            hackathon.participantCount(),
            3
        );

        // Check all participants are registered
        assertTrue(
            hackathon.isRegistered(participant1)
        );

        assertTrue(
            hackathon.isRegistered(participant2)
        );

        assertTrue(
            hackathon.isRegistered(participant3)
        );
    }

    function testFuzzCreateHackathon(
        string memory name,
        string memory description,
        uint256 prizeAmount
    ) public {
        vm.assume(prizeAmount > 0 && prizeAmount <= 100 ether);
        vm.assume(bytes(name).length > 0 && bytes(name).length < 50);
        vm.assume(bytes(description).length > 0 && bytes(description).length < 200);
        
        // Filter out strings with null bytes or other problematic characters
        vm.assume(bytes(name)[0] != 0x00);
        vm.assume(bytes(description)[0] != 0x00);
        
        // Additional validation for problematic UTF-8 sequences
        vm.assume(bytes(name)[0] < 0x80); // Only ASCII characters
        vm.assume(bytes(description)[0] < 0x80); // Only ASCII characters

        vm.prank(organizer);

        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 24 hours;

        Hackathon newHackathon = new Hackathon{value: prizeAmount}(
            name,
            description,
            startTime,
            endTime,
            organizer,
            1 ether // minimum sponsor contribution
        );

        (
            string memory storedName,
            ,
            ,
            ,
            uint256 storedPrize,
            ,
            ,
        ) = newHackathon.getHackathonDetails();

        assertEq(
            storedName,
            name
        );

        assertEq(
            storedPrize,
            prizeAmount
        );
    }
}
