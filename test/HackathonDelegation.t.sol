// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";
import "../contracts/HackathonFactory.sol";

contract HackathonDelegationTest is Test {
    Hackathon public hackathon;
    address public organizer;
    address public judge1;
    address public judge2;
    address public delegate1;
    address public delegate2;
    address public participant;

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

    event JudgeDelegated(address indexed judge, address indexed delegate);

    function setUp() public {
        organizer = makeAddr("organizer");
        judge1 = makeAddr("judge1");
        judge2 = makeAddr("judge2");
        delegate1 = makeAddr("delegate1");
        delegate2 = makeAddr("delegate2");
        participant = makeAddr("participant");

        vm.deal(organizer, 10 ether);
        vm.deal(participant, 10 ether);

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

        // Add judges
        vm.prank(organizer);
        hackathon.addJudge(judge1);

        vm.prank(organizer);
        hackathon.addJudge(judge2);
    }

    function testDelegateToAgent() public {
        vm.prank(judge1);
        vm.expectEmit(true, true, false, true);
        emit JudgeDelegated(judge1, delegate1);
        hackathon.delegateToAgent(delegate1);

        assertEq(hackathon.getJudgeDelegate(judge1), delegate1);
        assertEq(hackathon.getDelegateJudge(delegate1), judge1);
    }

    function testDelegateToAgentNonJudgeReverts() public {
        vm.prank(participant);
        vm.expectRevert("Only judges can delegate");
        hackathon.delegateToAgent(delegate1);
    }

    function testDelegateToAgentInvalidAddressReverts() public {
        vm.prank(judge1);
        vm.expectRevert("Invalid delegate address");
        hackathon.delegateToAgent(address(0));
    }

    function testDelegateToAgentSelfReverts() public {
        vm.prank(judge1);
        vm.expectRevert("Cannot delegate to yourself");
        hackathon.delegateToAgent(judge1);
    }

    function testDelegateToAgentAlreadyHasDelegateReverts() public {
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate1);

        vm.prank(judge1);
        vm.expectRevert("Already has a delegate");
        hackathon.delegateToAgent(delegate2);
    }

    function testRevokeDelegation() public {
        // First delegate
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate1);

        // Then revoke
        vm.prank(judge1);
        hackathon.revokeDelegation();

        assertEq(hackathon.getJudgeDelegate(judge1), address(0));
        assertEq(hackathon.getDelegateJudge(delegate1), address(0));
    }

    function testRevokeDelegationNonJudgeReverts() public {
        vm.prank(participant);
        vm.expectRevert("Only judges can revoke delegation");
        hackathon.revokeDelegation();
    }

    function testRevokeDelegationNoDelegateReverts() public {
        vm.prank(judge1);
        vm.expectRevert("No delegation to revoke");
        hackathon.revokeDelegation();
    }

    function testDelegateCanScoreSubmission() public {
        // Register participant
        vm.prank(participant);
        hackathon.register{value: 0.01 ether}();

        // Delegate judge
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate1);

        // Fast forward to hackathon start time
        vm.warp(block.timestamp + START_OFFSET + 1);

        // Create submission
        vm.prank(participant);
        hackathon.submitProject("Test Project", "https://github.com/test");

        // Fast forward to end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        // Delegate can score submission
        vm.prank(delegate1);
        hackathon.scoreSubmission(participant, 85);

        (address participantAddr, string memory name, string memory url, uint256 submissionTime, uint256 score, bool isEvaluated) = hackathon.getSubmission(participant);
        assertEq(score, 85);
        assertTrue(isEvaluated);
    }

    function testDelegateCanClaimJudgeReward() public {
        // Register participant
        vm.prank(participant);
        hackathon.register{value: 0.01 ether}();

        // Delegate judge
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate1);

        // Fast forward to hackathon start time
        vm.warp(block.timestamp + START_OFFSET + 1);

        // Create submission
        vm.prank(participant);
        hackathon.submitProject("Test Project", "https://github.com/test");

        // Fast forward to end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        // Hackathon ends automatically when deadline is reached

        // Add judge rewards by becoming a sponsor
        vm.deal(address(this), 1 ether);
        hackathon.becomeSponsor{value: 1 ether}();

        // Delegate can claim judge reward
        uint256 initialBalance = delegate1.balance;
        vm.prank(delegate1);
        hackathon.claimJudgeReward();

        assertEq(delegate1.balance, initialBalance + hackathon.getRewardPerJudge());
    }
}
