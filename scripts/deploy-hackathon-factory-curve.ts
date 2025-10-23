import { ethers } from "hardhat";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    console.log("🚀 Deploying HackathonFactory with Curve Finance Integration");
    console.log("═".repeat(60));

    // Mainnet addresses for Curve Finance integration
    const CURVE_POOL = "0x383E6b4437b59fff47B619CBA855CA29342A8559";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const PYUSD = "0x6C3ea9036406852006290770BeDfcAbc0E3ba16C";
    
    // Curve pool indices (these need to be verified on mainnet)
    const ETH_INDEX = 0;
    const PYUSD_INDEX = 1;

    try {
        console.log("📋 Deployment Parameters:");
        console.log(`Curve Pool: ${CURVE_POOL}`);
        console.log(`WETH: ${WETH}`);
        console.log(`PYUSD: ${PYUSD}`);
        console.log(`ETH Index: ${ETH_INDEX}`);
        console.log(`PYUSD Index: ${PYUSD_INDEX}`);
        console.log("");

        // Deploy the Hackathon implementation contract first
        console.log("1️⃣ Deploying Hackathon Implementation...");
        const Hackathon = await ethers.getContractFactory("Hackathon");
        const implementation = await Hackathon.deploy();
        await implementation.waitForDeployment();

        const implementationAddress = await implementation.getAddress();
        console.log("✅ Hackathon implementation deployed to:", implementationAddress);

        // Deploy the HackathonFactory with Curve Finance integration
        console.log("\n2️⃣ Deploying HackathonFactory with Curve Integration...");
        const HackathonFactory = await ethers.getContractFactory("HackathonFactory");
        const factory = await HackathonFactory.deploy(
            implementationAddress,
            CURVE_POOL,
            WETH,
            PYUSD,
            ETH_INDEX,
            PYUSD_INDEX
        );
        await factory.waitForDeployment();

        const factoryAddress = await factory.getAddress();
        console.log("✅ HackathonFactory deployed to:", factoryAddress);

        // Verify the deployment
        console.log("\n3️⃣ Verifying Deployment...");
        
        // Check implementation address
        const storedImplementation = await factory.implementation();
        if (storedImplementation.toLowerCase() === implementationAddress.toLowerCase()) {
            console.log("✅ Implementation address set correctly");
        } else {
            console.log("❌ Implementation address mismatch!");
        }

        // Check Curve pool configuration
        const [pool, ethIdx, pyusdIdx] = await factory.getCurvePoolInfo();
        console.log(`✅ Curve Pool: ${pool}`);
        console.log(`✅ ETH Index: ${ethIdx}`);
        console.log(`✅ PYUSD Index: ${pyusdIdx}`);

        // Check token addresses
        const wethAddress = await factory.weth();
        const pyusdAddress = await factory.pyusd();
        console.log(`✅ WETH: ${wethAddress}`);
        console.log(`✅ PYUSD: ${pyusdAddress}`);

        // Test basic functionality
        console.log("\n4️⃣ Testing Basic Functionality...");
        try {
            const hackathonCount = await factory.getHackathonCount();
            console.log(`✅ Initial hackathon count: ${hackathonCount}`);
            
            const pyusdBalance = await factory.getPyusdBalance();
            console.log(`✅ Initial PYUSD balance: ${ethers.formatUnits(pyusdBalance, 6)} PYUSD`);
            
            const wethBalance = await factory.getWethBalance();
            console.log(`✅ Initial WETH balance: ${ethers.formatEther(wethBalance)} WETH`);
        } catch (error) {
            console.log("⚠️  Basic functionality test failed (expected on local network):", error);
        }

        console.log("\n🎉 Deployment Summary:");
        console.log("═".repeat(60));
        console.log("📦 Implementation Contract:", implementationAddress);
        console.log("🏭 Factory Contract:", factoryAddress);
        console.log("🔗 Curve Pool:", CURVE_POOL);
        console.log("💰 WETH Token:", WETH);
        console.log("💵 PYUSD Token:", PYUSD);
        console.log("📊 ETH Index:", ETH_INDEX);
        console.log("📊 PYUSD Index:", PYUSD_INDEX);
        console.log("═".repeat(60));

        console.log("\n🔍 Verification Commands:");
        console.log("═".repeat(60));
        console.log(`# Verify Implementation:`);
        console.log(`npx hardhat verify --network mainnet ${implementationAddress}`);
        console.log("");
        console.log(`# Verify Factory:`);
        console.log(`npx hardhat verify --network mainnet ${factoryAddress} "${implementationAddress}" "${CURVE_POOL}" "${WETH}" "${PYUSD}" "${ETH_INDEX}" "${PYUSD_INDEX}"`);
        console.log("═".repeat(60));

        console.log("\n🌐 Explorer Links:");
        console.log("═".repeat(60));
        console.log(`Implementation: https://etherscan.io/address/${implementationAddress}`);
        console.log(`Factory: https://etherscan.io/address/${factoryAddress}`);
        console.log(`Curve Pool: https://etherscan.io/address/${CURVE_POOL}`);
        console.log(`WETH: https://etherscan.io/address/${WETH}`);
        console.log(`PYUSD: https://etherscan.io/address/${PYUSD}`);
        console.log("═".repeat(60));

        console.log("\n📝 Usage Instructions:");
        console.log("═".repeat(60));
        console.log("To create a hackathon with ETH to PYUSD conversion:");
        console.log("1. Call factory.createHackathon() with ETH value");
        console.log("2. Specify minimum PYUSD output for slippage protection");
        console.log("3. The factory will automatically convert ETH to PYUSD using Curve");
        console.log("4. PYUSD will be transferred to the hackathon contract");
        console.log("═".repeat(60));

        return {
            implementationAddress,
            factoryAddress,
            curvePool: CURVE_POOL,
            weth: WETH,
            pyusd: PYUSD,
            ethIndex: ETH_INDEX,
            pyusdIndex: PYUSD_INDEX
        };

    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then((result) => {
        console.log("\n✅ Deployment completed successfully!");
        console.log("Factory Address:", result?.factoryAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
    });
