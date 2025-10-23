// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";
import "../contracts/VotingTypes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title HackathonFactoryMainnetForkTest
 * @dev Tests HackathonFactory with live mainnet fork using Curve Finance
 */
contract HackathonFactoryMainnetForkTest is Test {
    HackathonFactory public factory;
    Hackathon public hackathon;

    // Mainnet addresses
    address constant CURVE_POOL = 0x383e6b4437b59fff47b619cba855ca29342a8559;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbC0e3bA16C;
    address constant USDC = 0xA0b86a33E6441b8c4C8C0E1234567890AbCdEf12; // Example USDC address

    // Test accounts
    address public organizer = makeAddr("organizer");
    address public judge1 = makeAddr("judge1");
    address public judge2 = makeAddr("judge2");
    address public participant1 = makeAddr("participant1");
    address public participant2 = makeAddr("participant2");

    // Test parameters
    uint256 public hackathonId = 1;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public minimumSponsorContribution = 0.1 ether;
    uint256 public stakeAmount = 0.01 ether;
    uint256[] public prizeDistribution;
    address[] public selectedJudges;
    VotingConfig public votingConfig;

    // Curve pool indices (these need to be verified on mainnet)
    int128 public constant ETH_INDEX = 0;
    int128 public constant PYUSD_INDEX = 1;

    function setUp() public {
        // Fork mainnet at a recent block
        vm.createFork("https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY");

        // Set up test time parameters
        startTime = block.timestamp + 1 days;
        endTime = startTime + 3 days;

        // Set up prize distribution
        prizeDistribution.push(1000 * 1e6); // 1000 PYUSD for 1st place
        prizeDistribution.push(500 * 1e6);  // 500 PYUSD for 2nd place
        prizeDistribution.push(250 * 1e6);  // 250 PYUSD for 3rd place

        // Set up judges
        selectedJudges.push(judge1);
        selectedJudges.push(judge2);

        // Set up voting configuration
        votingConfig = VotingConfig({
            systemType: VotingSystemType.OPEN,
            useQuadraticVoting: false,
            votingPowerPerJudge: 100,
            maxWinners: 3
        });

        // Deploy implementation contract
        address implementation = address(new Hackathon());

        // Deploy factory with Curve Finance integration
        factory = new HackathonFactory(
            implementation,
            CURVE_POOL,
            WETH,
            PYUSD,
            ETH_INDEX,
            PYUSD_INDEX
        );

        // Fund test accounts
        vm.deal(organizer, 10 ether);
        vm.deal(participant1, 1 ether);
        vm.deal(participant2, 1 ether);

        // Add judges to the factory
        vm.prank(address(factory));
        factory.addGlobalJudge(judge1);
        vm.prank(address(factory));
        factory.addGlobalJudge(judge2);
    }

    function testCurvePoolInfo() public {
        (address pool, int128 ethIdx, int128 pyusdIdx) = factory.getCurvePoolInfo();

        assertEq(pool, CURVE_POOL, "Incorrect Curve pool address");
        assertEq(ethIdx, ETH_INDEX, "Incorrect ETH index");
        assertEq(pyusdIdx, PYUSD_INDEX, "Incorrect PYUSD index");
    }

    function testEstimatePyusdOutput() public {
        uint256 ethAmount = 1 ether;
        uint256 estimatedPyusd = factory.estimatePyusdOutput(ethAmount);

        console.log("Estimated PYUSD for 1 ETH:", estimatedPyusd);
        assertTrue(estimatedPyusd > 0, "Estimation should return positive value");

        // The estimation should be reasonable (not 0, not extremely high)
        assertTrue(estimatedPyusd < ethAmount * 10000, "Estimation seems too high");
    }

    function testCreateHackathonWithCurveConversion() public {
        uint256 prizePoolEth = 2 ether;
        uint256 minPyusdOut = 3000 * 1e6; // 3000 PYUSD minimum (with slippage tolerance)

        // Get initial balances
        uint256 initialEthBalance = organizer.balance;
        uint256 initialPyusdBalance = IERC20(PYUSD).balanceOf(address(factory));

        console.log("Initial ETH balance:", initialEthBalance);
        console.log("Initial PYUSD balance:", initialPyusdBalance);

        // Create hackathon
        vm.prank(organizer);
        address hackathonAddress = factory.createHackathon{value: prizePoolEth}(
            hackathonId,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );

        // Verify hackathon was created
        assertTrue(hackathonAddress != address(0), "Hackathon address should not be zero");

        // Get final balances
        uint256 finalEthBalance = organizer.balance;
        uint256 finalPyusdBalance = IERC20(PYUSD).balanceOf(address(factory));
        uint256 hackathonPyusdBalance = IERC20(PYUSD).balanceOf(hackathonAddress);

        console.log("Final ETH balance:", finalEthBalance);
        console.log("Final PYUSD balance:", finalPyusdBalance);
        console.log("Hackathon PYUSD balance:", hackathonPyusdBalance);

        // Verify ETH was spent
        assertTrue(finalEthBalance < initialEthBalance, "ETH should have been spent");

        // Verify PYUSD was received and transferred to hackathon
        assertTrue(hackathonPyusdBalance > 0, "Hackathon should have received PYUSD");
        assertTrue(hackathonPyusdBalance >= minPyusdOut, "Should meet minimum PYUSD requirement");

        // Verify the total prize distribution can be covered
        uint256 totalPrizeDistribution = 0;
        for (uint256 i = 0; i < prizeDistribution.length; i++) {
            totalPrizeDistribution += prizeDistribution[i];
        }
        assertTrue(hackathonPyusdBalance >= totalPrizeDistribution, "PYUSD should cover prize distribution");

        console.log("Total prize distribution:", totalPrizeDistribution);
        console.log("Hackathon PYUSD balance:", hackathonPyusdBalance);
    }

    function testInsufficientPyusdOutput() public {
        uint256 prizePoolEth = 0.001 ether; // Very small amount
        uint256 minPyusdOut = 10000 * 1e6; // Unrealistically high minimum

        vm.prank(organizer);
        vm.expectRevert("Insufficient PYUSD output");
        factory.createHackathon{value: prizePoolEth}(
            hackathonId,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );
    }

    function testInsufficientPyusdForPrizeDistribution() public {
        uint256 prizePoolEth = 0.01 ether; // Very small amount
        uint256 minPyusdOut = 1; // Very low minimum

        // Set up very high prize distribution
        uint256[] memory highPrizeDistribution = new uint256[](1);
        highPrizeDistribution[0] = 100000 * 1e6; // 100,000 PYUSD

        vm.prank(organizer);
        vm.expectRevert("Insufficient PYUSD amount for prize distribution");
        factory.createHackathon{value: prizePoolEth}(
            hackathonId,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            highPrizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );
    }

    function testCurveConversionEvent() public {
        uint256 prizePoolEth = 1 ether;
        uint256 minPyusdOut = 2000 * 1e6;

        // Expect the conversion event
        vm.expectEmit(true, true, true, true);
        emit EthToPyusdConversion(prizePoolEth, 0, minPyusdOut); // We don't know exact output, so use 0

        vm.prank(organizer);
        factory.createHackathon{value: prizePoolEth}(
            hackathonId,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );
    }

    function testMultipleHackathons() public {
        uint256 prizePoolEth = 1 ether;
        uint256 minPyusdOut = 2000 * 1e6;

        // Create first hackathon
        vm.prank(organizer);
        address hackathon1 = factory.createHackathon{value: prizePoolEth}(
            1,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );

        // Create second hackathon
        vm.prank(organizer);
        address hackathon2 = factory.createHackathon{value: prizePoolEth}(
            2,
            startTime + 1 days,
            endTime + 1 days,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );

        // Verify both hackathons were created
        assertTrue(hackathon1 != address(0), "First hackathon should be created");
        assertTrue(hackathon2 != address(0), "Second hackathon should be created");
        assertTrue(hackathon1 != hackathon2, "Hackathons should be different addresses");

        // Verify factory tracking
        assertEq(factory.getHackathonCount(), 2, "Should have 2 hackathons");
        assertEq(factory.getOrganizerHackathonCount(organizer), 2, "Organizer should have 2 hackathons");
    }

    function testEmergencyWithdrawPyusd() public {
        // First create a hackathon to get some PYUSD in the factory
        uint256 prizePoolEth = 1 ether;
        uint256 minPyusdOut = 2000 * 1e6;

        vm.prank(organizer);
        factory.createHackathon{value: prizePoolEth}(
            hackathonId,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );

        // Check PYUSD balance
        uint256 pyusdBalance = factory.getPyusdBalance();
        console.log("PYUSD balance in factory:", pyusdBalance);

        // Only global judges can withdraw
        vm.prank(judge1);
        factory.emergencyWithdrawPyusd();

        // Verify PYUSD was withdrawn
        uint256 finalPyusdBalance = factory.getPyusdBalance();
        assertEq(finalPyusdBalance, 0, "PYUSD should be withdrawn");
    }

    function testNonJudgeCannotWithdraw() public {
        vm.prank(participant1);
        vm.expectRevert("Only global judges can call this function");
        factory.emergencyWithdrawPyusd();
    }

    function testCurvePoolDirectInteraction() public {
        // Test direct interaction with Curve pool
        uint256 ethAmount = 0.1 ether;

        // Get initial PYUSD balance
        uint256 initialPyusdBalance = IERC20(PYUSD).balanceOf(address(this));

        // Direct call to Curve pool
        ICurvePool(CURVE_POOL).exchange{value: ethAmount}(
            ETH_INDEX,
            PYUSD_INDEX,
            ethAmount,
            0 // No minimum for this test
        );

        // Check PYUSD received
        uint256 finalPyusdBalance = IERC20(PYUSD).balanceOf(address(this));
        uint256 pyusdReceived = finalPyusdBalance - initialPyusdBalance;

        console.log("PYUSD received from direct Curve call:", pyusdReceived);
        assertTrue(pyusdReceived > 0, "Should receive PYUSD from Curve");
    }

    function testGasUsage() public {
        uint256 prizePoolEth = 1 ether;
        uint256 minPyusdOut = 2000 * 1e6;

        uint256 gasStart = gasleft();

        vm.prank(organizer);
        factory.createHackathon{value: prizePoolEth}(
            hackathonId,
            startTime,
            endTime,
            minimumSponsorContribution,
            stakeAmount,
            prizeDistribution,
            selectedJudges,
            votingConfig,
            minPyusdOut
        );

        uint256 gasUsed = gasStart - gasleft();
        console.log("Gas used for hackathon creation:", gasUsed);

        // Gas usage should be reasonable (less than 1M gas)
        assertTrue(gasUsed < 1000000, "Gas usage should be reasonable");
    }

    // Helper function to get current block timestamp
    function getCurrentTime() public view returns (uint256) {
        return block.timestamp;
    }
}
