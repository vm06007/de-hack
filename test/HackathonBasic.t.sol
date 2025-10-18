// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";
import "../contracts/HackathonFactory.sol";

contract HackathonBasicTest is Test {
    Hackathon public hackathon;
    address public organizer;
    address public participant1;
    address public participant2;
    address public participant3;

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

    event ParticipantRegistered(address indexed participant);
    event SubmissionMade(address indexed participant, string projectName);
    event StakeDeposited(address indexed participant, uint256 amount);
    event StakeReturned(address indexed participant, uint256 amount);

    function setUp() public {
        organizer = makeAddr("organizer");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        participant3 = makeAddr("participant3");

        vm.deal(organizer, 10 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);
        vm.deal(participant3, 10 ether);

        // Deploy implementation contract
        Hackathon implementation = new Hackathon();

        // Deploy factory with implementation
        HackathonFactory factory = new HackathonFactory(address(implementation));

        // Create hackathon through factory
        vm.prank(organizer);
        address hackathonAddress = factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether, // minimum sponsor contribution
            new address[](0), // selected judges
            250, // 2.50% judge reward percentage
            0.01 ether, // stake amount
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether), // prize distribution [3, 1.5, 0.5] = 5 ether total
            1 days, // prize claim cooldown
            1 days, // judging duration
            VotingConfig({
                systemType: VotingSystemType.OPEN,
                useQuadraticVoting: false,
                creditsPerJudge: 0,
                pointsPerJudge: 100,
                maxWinners: 3
            })
        );

        hackathon = Hackathon(hackathonAddress);
    }

    function testHackathonInitialization()
        public
        view
    {
        assertEq(hackathon.name(), "Web3 Hackathon");
        assertEq(hackathon.description(), "Build the future of Web3");
        assertEq(hackathon.organizer(), organizer);
        assertEq(hackathon.prizePool(), PRIZE_POOL);
        assertTrue(hackathon.isActive());
        assertEq(hackathon.participantCount(), 0);
        assertEq(hackathon.minimumSponsorContribution(), 1 ether);
        assertEq(hackathon.getJudgeRewardPercentage(), 250);
        assertEq(hackathon.getStakeAmount(), 0.01 ether);
        assertEq(hackathon.getMaxWinners(), 3);
        assertEq(hackathon.getPrizeClaimCooldown(), 1 days);
    }

    function testRegisterParticipant() public {
        vm.prank(participant1);

        hackathon.register{value: 0.01 ether}();

        assertTrue(hackathon.isRegistered(participant1));
        assertEq(hackathon.participantCount(), 1);
        assertEq(hackathon.getParticipantStake(participant1), 0.01 ether);
        assertEq(hackathon.getTotalStakes(), 0.01 ether);
    }

    function testRegisterTwiceReverts() public {
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.prank(participant1);
        vm.expectRevert("Already registered");
        hackathon.register{value: 0.01 ether}();
    }

    function testRegisterAfterStartReverts() public {
        // Fast forward past start time
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Registration closed - hackathon has started");
        hackathon.register{value: 0.01 ether}();
    }

    function testSubmitProject() public {
        // Register participant
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);

        hackathon.submitProject(
            "DeFi Protocol",
            "https://github.com/example/defi"
        );

        assertTrue(hackathon.hasSubmitted(participant1));
        assertEq(hackathon.getParticipantStake(participant1), 0);
        assertEq(hackathon.getTotalStakes(), 0);

        (
            address submitter,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        ) = hackathon.getSubmission(participant1);

        assertEq(submitter, participant1);
        assertEq(projectName, "DeFi Protocol");
        assertEq(projectUrl, "https://github.com/example/defi");
        assertTrue(submissionTime > 0);
        assertEq(score, 0);
        assertFalse(isEvaluated);
    }

    function testSubmitProjectNotRegisteredReverts() public {
        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Not registered for this hackathon");
        hackathon.submitProject("Test Project", "https://test.com");
    }

    function testSubmitProjectTwiceReverts() public {
        // Register participant
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        hackathon.submitProject("First Project", "https://first.com");

        vm.prank(participant1);
        vm.expectRevert("Already submitted");
        hackathon.submitProject("Second Project", "https://second.com");
    }

    function testSubmitBeforeStartReverts() public {
        // Register participant
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.prank(participant1);
        vm.expectRevert("Not during submission phase");
        hackathon.submitProject("Test Project", "https://test.com");
    }

    function testSubmitAfterEndReverts() public {
        // Register participant
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        // Fast forward past end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Not during submission phase");
        hackathon.submitProject("Test Project", "https://test.com");
    }

    function testIsRegistrationOpen() public {
        // Before start time
        assertTrue(hackathon.isRegistrationOpen());

        // Fast forward to start time
        vm.warp(block.timestamp + START_OFFSET);
        assertFalse(hackathon.isRegistrationOpen());

        // Fast forward past start time
        vm.warp(block.timestamp + START_OFFSET + 1);
        assertFalse(hackathon.isRegistrationOpen());
    }

    function testIsSubmissionOpen()
        public
    {
        // Before start time
        assertFalse(hackathon.isSubmissionOpen());

        // At start time
        vm.warp(block.timestamp + START_OFFSET);
        assertTrue(hackathon.isSubmissionOpen());

        // During hackathon
        vm.warp(block.timestamp + START_OFFSET + 12 hours);
        assertTrue(hackathon.isSubmissionOpen());

        // At end time
        vm.warp(block.timestamp + START_OFFSET + DURATION);
        assertFalse(hackathon.isSubmissionOpen());

        // After end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        assertFalse(hackathon.isSubmissionOpen());
    }

    function testMultipleParticipants() public {
        // Register multiple participants
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.prank(participant2);
        hackathon.register{value: 0.01 ether}();

        vm.prank(participant3);
        hackathon.register{value: 0.01 ether}();

        assertEq(hackathon.participantCount(), 3);
        assertTrue(hackathon.isRegistered(participant1));
        assertTrue(hackathon.isRegistered(participant2));
        assertTrue(hackathon.isRegistered(participant3));
        assertEq(hackathon.getTotalStakes(), 0.03 ether);
    }
}
