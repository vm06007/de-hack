import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables properly using dotenv
dotenv.config();

async function main() {
    console.log("Deploy & Verify on Mainnet");
    console.log("═".repeat(50));

    try {
        // Deploy using Hardhat Ignition with echo to handle prompts
        console.log("\nDeploying Counter contract...");

        // Use yes command to automatically answer all prompts with 'y'
        const deployCommand = `yes | npx hardhat ignition deploy ignition/modules/Counter.ts --network mainnet --reset`;

        const deployOutput = execSync(deployCommand, {
            encoding: 'utf8',
            env: {
                ...process.env,
                MAINNET_PRIVATE_KEY: process.env.MAINNET_PRIVATE_KEY
            }
        });

        console.log("Deployment completed!");

        // Extract contract address from deployment output
        const addressMatch = deployOutput.match(/CounterModule#Counter - (0x[a-fA-F0-9]{40})/);
        const contractAddress = addressMatch ? addressMatch[1] : null;

        if (!contractAddress) {
            throw new Error("Could not extract contract address from deployment output");
        }

        console.log(`Contract Address: ${contractAddress}`);

        // Wait for indexing
        console.log("\nWaiting 30 seconds for indexing...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Verify
        console.log("\nVerifying contract...");
        try {
            execSync(`npx hardhat verify --network mainnet ${contractAddress}`, {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    MAINNET_PRIVATE_KEY: process.env.MAINNET_PRIVATE_KEY,
                    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY
                }
            });

            console.log("Contract verified successfully!");
        } catch (verifyError: any) {
            if (verifyError.message.includes("already verified")) {
                console.log("Contract already verified!");
            } else {
                console.error("Verification failed:", verifyError.message);
            }
        }

        console.log("\nSummary");
        console.log("═".repeat(50));
        console.log(`Contract: Counter`);
        console.log(`Address: ${contractAddress}`);
        console.log(`Blockscout: https://eth.blockscout.com/address/${contractAddress}#code`);
        console.log("═".repeat(50));

    } catch (error) {
        console.error("\nDeployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => {
        console.log("\nAll operations completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nScript failed:", error);
        process.exit(1);
    });
