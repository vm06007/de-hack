const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Curve Pool Verification", function () {
    let curvePoolTest;

    // Expected token addresses
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const PYUSD = "0x6C3ea9036406852006290770BeDfcAbc0E3ba16C";

    beforeEach(async function () {
        const CurvePoolVerificationTest = await ethers.getContractFactory("CurvePoolVerificationTest");
        curvePoolTest = await CurvePoolVerificationTest.deploy();
    });

    it("Should verify Curve pool token indices", async function () {
        const [token0, token1] = await curvePoolTest.getCurvePoolTokens();

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
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);
        }
    });

    it("Should test exchange rates", async function () {
        const oneEth = ethers.parseEther("1");

        try {
            // Test exchange rate with current indices (0 -> 1)
            const rate1 = await curvePoolTest.getExchangeRate(0, 1, oneEth);
            console.log("Rate 0->1 (1 ETH):", ethers.formatEther(rate1));
        } catch (error) {
            console.log("Rate 0->1 failed:", error.message);
        }

        try {
            // Test exchange rate with swapped indices (1 -> 0)
            const rate2 = await curvePoolTest.getExchangeRate(1, 0, oneEth);
            console.log("Rate 1->0 (1 ETH):", ethers.formatEther(rate2));
        } catch (error) {
            console.log("Rate 1->0 failed:", error.message);
        }
    });

    it("Should verify indices are correct", async function () {
        const isCorrect = await curvePoolTest.verifyIndices();
        console.log("Indices are correct:", isCorrect);

        if (!isCorrect) {
            const [token0, token1] = await curvePoolTest.getCurvePoolTokens();
            console.log("Actual tokens in pool:");
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);
        }
    });
});
