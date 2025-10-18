// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";
import "../contracts/HackathonFactory.sol";

contract HackathonJudgeTest is Test {

    Hackathon public hackathon;
    address public organizer;
    address public judge1;
    address public judge2;
    address public judge3;

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

    event JudgeAdded(address indexed judge);

    function setUp() public {
        organizer = makeAddr("organizer");
        judge1 = makeAddr("judge1");
        judge2 = makeAddr("judge2");
        judge3 = makeAddr("judge3");

        vm.deal(organizer, 10 ether);

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

    function testaddJudge() public {
        vm.prank(organizer);
        vm.expectEmit(true, false, false, true);
        emit JudgeAdded(judge1);
        hackathon.addJudge(judge1);

        assertTrue(hackathon.isJudge(judge1));
        address[] memory judges = hackathon.getJudges();
        assertEq(judges.length, 1);
        assertEq(judges[0], judge1);
    }

    function testAddJudgeNonOrganizerReverts() public {
        vm.prank(judge1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.addJudge(judge1);
    }

    function testAddJudgeInvalidAddressReverts() public {
        vm.prank(organizer);
        vm.expectRevert("Invalid judge address");
        hackathon.addJudge(address(0));
    }

    function testaddJudgeAlreadyExistsReverts() public {

        vm.prank(organizer);
        hackathon.addJudge(judge1);

        vm.prank(organizer);
        vm.expectRevert("Judge already added");
        hackathon.addJudge(judge1);
    }

    function testaddJudgeInactiveHackathonReverts() public {

        // Make hackathon inactive by warping past end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        // Hackathon becomes inactive automatically when deadline is reached

        vm.prank(organizer);
        vm.expectRevert("Cannot add judges after hackathon ends");
        hackathon.addJudge(judge1);
    }

    function testaddJudgeAfterEndTimeReverts() public {
        // Fast forward past end time but don't end hackathon
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Cannot add judges after hackathon ends");
        hackathon.addJudge(judge1);
    }
}
