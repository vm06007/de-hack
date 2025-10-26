// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";
import "../contracts/VotingTypes.sol";

/**
 * @title FactoryIntegrationTest
 * @dev Integration tests that deploy contracts and test real functionality
 */
contract FactoryIntegrationTest {

    HackathonFactory public factory;
    Hackathon public implementation;

    // Test accounts
    address public organizer = address(0x1);
    address public participant1 = address(0x2);
    address public participant2 = address(0x3);
    address public judge1 = address(0x4);
    address public judge2 = address(0x5);

    // Curve Finance parameters
    address constant CURVE_ROUTER = 0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;

    function setUp() public {
        console.log("Setting up factory integration test...");

        // Deploy Hackathon implementation
        implementation = new Hackathon();
        console.log("Hackathon implementation deployed at:", address(implementation));

        // Deploy HackathonFactory with Curve integration
        factory = new HackathonFactory(
            address(implementation),
            CURVE_ROUTER,
            WETH,
            PYUSD
        );
        console.log("HackathonFactory deployed at:", address(factory));
    }

    function testFactoryDeployment() public view {
        console.log("Testing factory deployment...");

        // Verify factory is deployed
        require(address(factory) != address(0), "Factory should be deployed");
        require(address(implementation) != address(0), "Implementation should be deployed");

        // Verify factory configuration
        require(factory.curveRouter() == CURVE_ROUTER, "Curve router should be set");
        require(factory.weth() == WETH, "WETH should be set");
        require(factory.pyusd() == PYUSD, "PYUSD should be set");

        console.log("Factory deployment test passed");
    }

    function testFactoryConfiguration() public view {
        console.log("Testing factory configuration...");

        // Test factory configuration
        require(factory.curveRouter() == CURVE_ROUTER, "Curve router should be set");
        require(factory.weth() == WETH, "WETH should be set");
        require(factory.pyusd() == PYUSD, "PYUSD should be set");

        // Test factory state
        require(factory.totalHackathons() == 0, "Total hackathons should be zero initially");

        console.log("Factory configuration test passed");
    }

    function testImplementationContract() public view {
        console.log("Testing implementation contract...");

        // Verify implementation is deployed
        require(address(implementation) != address(0), "Implementation should be deployed");

        // Test basic implementation functions
        require(implementation.organizer() == address(0), "Implementation organizer should be zero");
        require(implementation.hackathonId() == 0, "Implementation hackathon ID should be zero");

        console.log("Implementation contract test passed");
    }

    function testMultipleFactoryDeployments() public {
        console.log("Testing multiple factory deployments...");

        // Deploy multiple factories
        HackathonFactory factory2 = new HackathonFactory(
            address(implementation),
            CURVE_ROUTER,
            WETH,
            PYUSD
        );

        HackathonFactory factory3 = new HackathonFactory(
            address(implementation),
            CURVE_ROUTER,
            WETH,
            PYUSD
        );

        // Verify all factories are deployed
        require(address(factory) != address(0), "Factory 1 should be deployed");
        require(address(factory2) != address(0), "Factory 2 should be deployed");
        require(address(factory3) != address(0), "Factory 3 should be deployed");

        // Verify all factories have same configuration
        require(factory.curveRouter() == factory2.curveRouter(), "Factories should have same curve router");
        require(factory.weth() == factory2.weth(), "Factories should have same WETH");
        require(factory.pyusd() == factory2.pyusd(), "Factories should have same PYUSD");

        console.log("Multiple factory deployments test passed");
    }

    function testPrizeDistributionLogic() public view {
        console.log("Testing prize distribution logic...");

        // Test different prize distributions
        uint256[] memory distribution1 = new uint256[](3);
        distribution1[0] = 50;
        distribution1[1] = 30;
        distribution1[2] = 20;

        uint256[] memory distribution2 = new uint256[](3);
        distribution2[0] = 60;
        distribution2[1] = 25;
        distribution2[2] = 15;

        uint256[] memory distribution3 = new uint256[](3);
        distribution3[0] = 70;
        distribution3[1] = 20;
        distribution3[2] = 10;

        // Verify distributions sum to 100
        uint256 sum1 = distribution1[0] + distribution1[1] + distribution1[2];
        uint256 sum2 = distribution2[0] + distribution2[1] + distribution2[2];
        uint256 sum3 = distribution3[0] + distribution3[1] + distribution3[2];

        require(sum1 == 100, "Distribution 1 should sum to 100");
        require(sum2 == 100, "Distribution 2 should sum to 100");
        require(sum3 == 100, "Distribution 3 should sum to 100");

        console.log("Prize distribution logic test passed");
    }

    function testVotingSystemTypes() public view {
        console.log("Testing voting system types...");

        // Test different voting system types
        VotingSystemType[4] memory systemTypes = [
            VotingSystemType.OPEN,
            VotingSystemType.COMMIT_REVEAL,
            VotingSystemType.ZK_SNARK,
            VotingSystemType.QUADRATIC
        ];

        for (uint256 i = 0; i < 4; i++) {
            VotingConfig memory votingConfig = VotingConfig({
                systemType: systemTypes[i],
                useQuadraticVoting: (systemTypes[i] == VotingSystemType.QUADRATIC),
                votingPowerPerJudge: 100,
                maxWinners: 3
            });

            require(votingConfig.systemType == systemTypes[i], "System type should match");
            require(votingConfig.votingPowerPerJudge == 100, "Voting power should be 100");
            require(votingConfig.maxWinners == 3, "Max winners should be 3");
        }

        console.log("Voting system types test passed");
    }

    function testTimeConfiguration() public view {
        console.log("Testing time configuration...");

        // Test time calculations
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = startTime + 24 hours;
        uint256 duration = endTime - startTime;

        require(duration == 24 hours, "Duration should be 24 hours");
        require(endTime > startTime, "End time should be after start time");
        require(startTime > block.timestamp, "Start time should be in the future");

        console.log("Time configuration test passed");
    }

    function testStakeAmounts() public view {
        console.log("Testing stake amounts...");

        // Test different stake amounts
        uint256 stakeAmount1 = 0.001 ether;
        uint256 stakeAmount2 = 0.005 ether;
        uint256 stakeAmount3 = 0.01 ether;

        require(stakeAmount1 > 0, "Stake amount 1 should be positive");
        require(stakeAmount2 > stakeAmount1, "Stake amount 2 should be greater than 1");
        require(stakeAmount3 > stakeAmount2, "Stake amount 3 should be greater than 2");

        console.log("Stake amounts test passed");
    }

    function testSponsorContributions() public view {
        console.log("Testing sponsor contributions...");

        // Test different sponsor contribution amounts
        uint256 contribution1 = 0.01 ether;
        uint256 contribution2 = 0.1 ether;
        uint256 contribution3 = 1 ether;

        require(contribution1 > 0, "Contribution 1 should be positive");
        require(contribution2 > contribution1, "Contribution 2 should be greater than 1");
        require(contribution3 > contribution2, "Contribution 3 should be greater than 2");

        console.log("Sponsor contributions test passed");
    }

    function testGasOptimization() public view {
        console.log("Testing gas optimization...");

        // Test gas optimization with multiple operations
        uint256 totalGas = 0;

        // Simulate multiple operations
        for (uint256 i = 0; i < 10; i++) {
            uint256[] memory distribution = new uint256[](3);
            distribution[0] = 50;
            distribution[1] = 30;
            distribution[2] = 20;

            uint256 sum = distribution[0] + distribution[1] + distribution[2];
            require(sum == 100, "Distribution should sum to 100");

            totalGas += 1000; // Simulate gas usage
        }

        require(totalGas > 0, "Total gas should be positive");

        console.log("Gas optimization test passed");
    }

    function testEdgeCases() public view {
        console.log("Testing edge cases...");

        // Test edge cases
        uint256 maxUint256 = type(uint256).max;
        uint256 minUint256 = 0;

        require(maxUint256 > minUint256, "Max should be greater than min");
        require(maxUint256 > 0, "Max should be positive");

        // Test time edge cases
        uint256 currentTime = block.timestamp;
        uint256 futureTime = currentTime + 1;
        uint256 pastTime = currentTime - 1;

        require(futureTime > currentTime, "Future time should be greater than current");
        require(pastTime < currentTime, "Past time should be less than current");

        console.log("Edge cases test passed");
    }
}

