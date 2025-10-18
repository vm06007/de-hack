// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/VotingTypes.sol";

contract HackathonPrizeTest is Test {
    Hackathon public hackathon;
    address public organizer;
    address public participant1;
    address public participant2;
    address public judge1;

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

    event PrizeDistributed(address indexed participant, uint256 amount);
    event EmergencyWithdraw(address indexed organizer, uint256 amount);

    function setUp() public {
        organizer = makeAddr("organizer");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        judge1 = makeAddr("judge1");

        vm.deal(organizer, 10 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);

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
                votingPowerPerJudge: 100,
                maxWinners: 3
            })
        );

        hackathon = Hackathon(hackathonAddress);
    }

    function testDistributePrize() public {
        // Register and submit project
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.warp(block.timestamp + START_OFFSET + 1);
        vm.prank(participant1);
        hackathon.submitProject("Test Project", "https://test.com");

        // End hackathon by warping past deadline
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        // Hackathon ends automatically when deadline is reached

        uint256 initialBalance = participant1.balance;
        uint256 prizeAmount = 1 ether;

        vm.prank(organizer);
        vm.expectEmit(true, false, false, true);
        emit PrizeDistributed(participant1, prizeAmount);
        hackathon.distributePrize(participant1, prizeAmount);

        assertEq(participant1.balance, initialBalance + prizeAmount);
        assertEq(hackathon.prizePool(), PRIZE_POOL - prizeAmount);
    }

    function testDistributePrizeNonOrganizerReverts() public {
        // Register and submit project
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.warp(block.timestamp + START_OFFSET + 1);
        vm.prank(participant1);
        hackathon.submitProject("Test Project", "https://test.com");

        // End hackathon by warping past deadline
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        // Hackathon ends automatically when deadline is reached

        vm.prank(participant1);
        vm.expectRevert("Only organizer or sponsors can distribute prizes");
        hackathon.distributePrize(participant1, 1 ether);
    }

    function testDistributePrizeTooMuchReverts() public {
        // Register and submit project
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.warp(block.timestamp + START_OFFSET + 1);
        vm.prank(participant1);
        hackathon.submitProject("Test Project", "https://test.com");

        // End hackathon by warping past deadline
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        // Hackathon ends automatically when deadline is reached

        vm.prank(organizer);
        vm.expectRevert("Amount exceeds prize pool");
        hackathon.distributePrize(participant1, PRIZE_POOL + 1);
    }

    function testDistributePrizeZeroAmountReverts() public {
        // Register and submit project
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.warp(block.timestamp + START_OFFSET + 1);
        vm.prank(participant1);
        hackathon.submitProject("Test Project", "https://test.com");

        // End hackathon by warping past deadline
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        // Hackathon ends automatically when deadline is reached

        vm.prank(organizer);
        vm.expectRevert("Amount must be greater than 0");
        hackathon.distributePrize(participant1, 0);
    }

    function testDistributePrizeWhileActiveReverts() public {
        // Register and submit project
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.warp(block.timestamp + START_OFFSET + 1);
        vm.prank(participant1);
        hackathon.submitProject("Test Project", "https://test.com");

        vm.prank(organizer);
        vm.expectRevert("Hackathon is still active");
        hackathon.distributePrize(participant1, 1 ether);
    }

    // Note: emergencyWithdraw function has been removed

    function testEndHackathon() public {
        // Add a judge first
        vm.prank(organizer);
        hackathon.addJudge(judge1);

        // Register and submit project
        vm.prank(participant1);
        hackathon.register{value: 0.01 ether}();

        vm.warp(block.timestamp + START_OFFSET + 1);
        vm.prank(participant1);
        hackathon.submitProject("Test Project", "https://test.com");

        // End hackathon by warping past deadline
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        // Hackathon ends automatically when deadline is reached
        // Now we're in the voting phase, so we can vote
        vm.prank(judge1);
        hackathon.voteForSubmission(participant1, 50);

        assertFalse(hackathon.isActive());
    }

    // Note: endHackathon function has been removed - hackathons end automatically
}
