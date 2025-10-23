const { ethers } = require("hardhat");

async function main() {
    // Curve pool address
    const CURVE_POOL = "0x383E6b4437b59fff47B619CBA855CA29342A8559";

    // Expected token addresses
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const PYUSD = "0x6C3ea9036406852006290770BeDfcAbc0E3ba16C";

    // Get the Curve pool contract
    const curvePool = await ethers.getContractAt("ICurvePool", CURVE_POOL);

    console.log("Checking Curve pool tokens...");

    try {
        // Check what tokens are in the pool
        const token0 = await curvePool.coins(0);
        const token1 = await curvePool.coins(1);

        console.log("Token 0 (index 0):", token0);
        console.log("Token 1 (index 1):", token1);
        console.log("Expected WETH:", WETH);
        console.log("Expected PYUSD:", PYUSD);

        // Check if our indices are correct
        if (token0.toLowerCase() === WETH.toLowerCase() && token1.toLowerCase() === PYUSD.toLowerCase()) {
            console.log("Indices are correct: ETH=0, PYUSD=1");
        } else if (token0.toLowerCase() === PYUSD.toLowerCase() && token1.toLowerCase() === WETH.toLowerCase()) {
            console.log("Indices are swapped: ETH=1, PYUSD=0");
        } else {
            console.log("Pool contains different tokens than expected");
        }

        // Test exchange rates
        console.log("\nTesting exchange rates...");

        try {
            const rate1 = await curvePool.get_dy(0, 1, ethers.parseEther("1"));
            console.log("Rate 0->1 (1 ETH):", ethers.formatEther(rate1), "PYUSD");
        } catch (error) {
            console.log("Rate 0->1 failed:", error.message);
        }

        try {
            const rate2 = await curvePool.get_dy(1, 0, ethers.parseEther("1"));
            console.log("Rate 1->0 (1 ETH):", ethers.formatEther(rate2), "PYUSD");
        } catch (error) {
            console.log("Rate 1->0 failed:", error.message);
        }

    } catch (error) {
        console.error("Error checking Curve pool:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
