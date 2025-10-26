import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables properly using dotenv
dotenv.config();

async function main() {
    console.log("🚀 Deploy & Verify HackathonFactory with Curve Finance on Mainnet");
    console.log("═".repeat(70));

    try {
        // Deploy using Hardhat Ignition
        console.log("\n📦 Deploying HackathonFactory with Curve Integration...");

        // Use yes command to automatically answer all prompts with 'y'
        const deployCommand = `yes | npx hardhat ignition deploy ignition/modules/HackathonFactoryCurve.ts --network mainnet --reset`;

        const deployOutput = execSync(deployCommand, {
            encoding: 'utf8',
            env: {
                ...process.env,
                MAINNET_PRIVATE_KEY: process.env.MAINNET_PRIVATE_KEY
            }
        });

        console.log("✅ Deployment completed!");

        // Extract contract addresses from deployment output
        const implementationMatch = deployOutput.match(/HackathonFactoryCurveModule#hackathonImplementation - (0x[a-fA-F0-9]{40})/);
        const factoryMatch = deployOutput.match(/HackathonFactoryCurveModule#hackathonFactory - (0x[a-fA-F0-9]{40})/);
        
        const implementationAddress = implementationMatch ? implementationMatch[1] : null;
        const factoryAddress = factoryMatch ? factoryMatch[1] : null;

        if (!implementationAddress || !factoryAddress) {
            throw new Error("Could not extract contract addresses from deployment output");
        }

        console.log(`📦 Implementation Address: ${implementationAddress}`);
        console.log(`🏭 Factory Address: ${factoryAddress}`);

        // Wait for indexing
        console.log("\n⏳ Waiting 30 seconds for indexing...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Verify Implementation
        console.log("\n🔍 Verifying Implementation contract...");
        try {
            execSync(`npx hardhat verify --network mainnet ${implementationAddress}`, {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    MAINNET_PRIVATE_KEY: process.env.MAINNET_PRIVATE_KEY,
                    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY
                }
            });
            console.log("✅ Implementation verified successfully!");
        } catch (verifyError: any) {
            if (verifyError.message.includes("already verified")) {
                console.log("✅ Implementation already verified!");
            } else {
                console.error("❌ Implementation verification failed:", verifyError.message);
            }
        }

        // Verify Factory
        console.log("\n🔍 Verifying Factory contract...");
        try {
            const CURVE_POOL = "0x383E6b4437b59fff47B619CBA855CA29342A8559";
            const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
            const PYUSD = "0x6C3ea9036406852006290770BeDfcAbc0E3ba16C";
            const ETH_INDEX = 0;
            const PYUSD_INDEX = 1;

            const verifyCommand = `npx hardhat verify --network mainnet ${factoryAddress} "${implementationAddress}" "${CURVE_POOL}" "${WETH}" "${PYUSD}" "${ETH_INDEX}" "${PYUSD_INDEX}"`;
            
            execSync(verifyCommand, {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    MAINNET_PRIVATE_KEY: process.env.MAINNET_PRIVATE_KEY,
                    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY
                }
            });
            console.log("✅ Factory verified successfully!");
        } catch (verifyError: any) {
            if (verifyError.message.includes("already verified")) {
                console.log("✅ Factory already verified!");
            } else {
                console.error("❌ Factory verification failed:", verifyError.message);
            }
        }

        console.log("\n🎉 Deployment & Verification Summary");
        console.log("═".repeat(70));
        console.log("📦 Implementation Contract:", implementationAddress);
        console.log("🏭 Factory Contract:", factoryAddress);
        console.log("🔗 Curve Pool: 0x383E6b4437b59fff47B619CBA855CA29342A8559");
        console.log("💰 WETH Token: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
        console.log("💵 PYUSD Token: 0x6C3ea9036406852006290770BeDfcAbc0E3ba16C");
        console.log("═".repeat(70));

        console.log("\n🌐 Explorer Links:");
        console.log("═".repeat(70));
        console.log(`Implementation: https://etherscan.io/address/${implementationAddress}`);
        console.log(`Factory: https://etherscan.io/address/${factoryAddress}`);
        console.log(`Curve Pool: https://etherscan.io/address/0x383E6b4437b59fff47B619CBA855CA29342A8559`);
        console.log(`WETH: https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`);
        console.log(`PYUSD: https://etherscan.io/address/0x6C3ea9036406852006290770BeDfcAbc0E3ba16C`);
        console.log("═".repeat(70));

        console.log("\n📝 Usage Instructions:");
        console.log("═".repeat(70));
        console.log("To create a hackathon with ETH to PYUSD conversion:");
        console.log("1. Call factory.createHackathon() with ETH value");
        console.log("2. Specify minimum PYUSD output for slippage protection");
        console.log("3. The factory will automatically convert ETH to PYUSD using Curve");
        console.log("4. PYUSD will be transferred to the hackathon contract");
        console.log("═".repeat(70));

        console.log("\n🧪 Test Commands:");
        console.log("═".repeat(70));
        console.log("# Test on mainnet fork:");
        console.log("npx hardhat test test/CurveIntegrationTest.sol --network hardhat");
        console.log("");
        console.log("# Run comprehensive tests:");
        console.log("./scripts/run-hardhat-tests.sh");
        console.log("═".repeat(70));

    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => {
        console.log("\n✅ All operations completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
    });
