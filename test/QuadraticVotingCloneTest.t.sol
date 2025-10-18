// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/OpenVoting.sol";
import "../contracts/QuadraticVoting.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title QuadraticVotingCloneTest
 * @dev Test to demonstrate gas efficiency improvements with QVWrapper cloning
 */
contract QuadraticVotingCloneTest is Test {

    function testQVWrapperCloneEfficiency() public {
        // Deploy base voting system
        OpenVoting baseVoting = new OpenVoting();

        // Test direct deployment cost
        uint256 gasBeforeDirect = gasleft();
        QVWrapper directDeployment = new QVWrapper();
        directDeployment.initialize(address(baseVoting), 1000);
        uint256 directGasUsed = gasBeforeDirect - gasleft();

        // Test clone deployment cost
        uint256 gasBeforeClone = gasleft();
        address cloneDeployment = Clones.clone(address(directDeployment));
        QVWrapper(cloneDeployment).initialize(address(baseVoting), 1000);
        uint256 cloneGasUsed = gasBeforeClone - gasleft();

        // Calculate savings
        uint256 gasSavings = directGasUsed - cloneGasUsed;
        uint256 efficiencyImprovement = (gasSavings * 100) / directGasUsed;

        console.log("Direct Deployment Gas:", directGasUsed);
        console.log("Clone Deployment Gas:", cloneGasUsed);
        console.log("Gas Savings:", gasSavings);
        console.log("Efficiency Improvement:", efficiencyImprovement, "%");

        // Verify both contracts are deployed
        assertTrue(address(directDeployment) != address(0));
        assertTrue(cloneDeployment != address(0));
        assertTrue(address(directDeployment) != cloneDeployment);

        // Verify clone is properly initialized
        assertTrue(QVWrapper(cloneDeployment).initialized());
        assertEq(address(QVWrapper(cloneDeployment).baseVotingSystem()), address(baseVoting));
        assertEq(QVWrapper(cloneDeployment).creditsPerJudge(), 1000);
    }
}
