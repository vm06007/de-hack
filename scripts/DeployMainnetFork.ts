import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * @title DeployMainnetForkScript
 * @dev Hardhat deployment script for testing on mainnet fork
 */
async function main() {
    console.log("Deploying contracts on mainnet fork...");
    console.log("═".repeat(50));

    try {
        // Deploy using Hardhat Ignition
        console.log("\nDeploying HackathonFactory with Curve Integration...");

        // Use Hardhat Ignition to deploy
        const deployCommand = `npx hardhat ignition deploy ignition/modules/HackathonFactory.ts --network hardhat`;

        const deployOutput = execSync(deployCommand, {
            encoding: 'utf8',
            env: {
                ...process.env,
            }
        });

        console.log("Deployment completed!");
        console.log("Deployment output:", deployOutput);

        // Extract contract addresses from deployment output
        const factoryMatch = deployOutput.match(/HackathonFactoryModule#HackathonFactory - (0x[a-fA-F0-9]{40})/);
        const implementationMatch = deployOutput.match(/HackathonFactoryModule#Hackathon - (0x[a-fA-F0-9]{40})/);

        if (factoryMatch && implementationMatch) {
            const factoryAddress = factoryMatch[1];
            const implementationAddress = implementationMatch[1];

            console.log("\nDeployment Summary:");
            console.log("Factory address:", factoryAddress);
            console.log("Implementation address:", implementationAddress);

            // Save deployment info
            const deploymentInfo = {
                factory: factoryAddress,
                implementation: implementationAddress,
                curvePool: "0x383e6b4437b59fff47b619cba855ca29342a8559",
                weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                pyusd: "0x6c3ea9036406852006290770BEdFcAbC0e3bA16C",
                ethIndex: 0,
                pyusdIndex: 1,
                timestamp: new Date().toISOString()
            };

            console.log("\nFull Deployment Info:");
            console.log(JSON.stringify(deploymentInfo, null, 2));

        } else {
            console.log("Could not extract contract addresses from deployment output");
        }

        console.log("\nDeployment completed successfully!");

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

// Execute the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });