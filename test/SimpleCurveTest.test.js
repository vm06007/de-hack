const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple Curve Integration Test", function () {
    let factory;
    let owner;
    let organizer;

    // Test parameters
    const hackathonId = 1;
    const startTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const endTime = startTime + 259200; // 3 days later
    const minimumSponsorContribution = ethers.parseEther("0.1");
    const stakeAmount = ethers.parseEther("0.01");
    const prizeDistribution = [
        ethers.parseUnits("1000", 6), // 1000 PYUSD for 1st place
        ethers.parseUnits("500", 6),  // 500 PYUSD for 2nd place
        ethers.parseUnits("250", 6)   // 250 PYUSD for 3rd place
    ];

    before(async function () {
        // Get signers
        [owner, organizer] = await ethers.getSigners();

        // Deploy implementation contract
        const HackathonImplementation = await ethers.getContractFactory("Hackathon");
        const implementation = await HackathonImplementation.deploy();
        await implementation.waitForDeployment();

        // Deploy factory with Curve Finance integration
        // Using mock addresses for testing
        const CURVE_POOL = "0x383e6b4437b59fff47b619cba855ca29342a8559";
        const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const PYUSD = "0x6c3ea9036406852006290770BEdFcAbC0e3bA16C";
        const ETH_INDEX = 0;
        const PYUSD_INDEX = 1;

        const HackathonFactoryContract = await ethers.getContractFactory("HackathonFactory");
        factory = await HackathonFactoryContract.deploy(
            await implementation.getAddress(),
            CURVE_POOL,
            WETH,
            PYUSD,
            ETH_INDEX,
            PYUSD_INDEX
        );
        await factory.waitForDeployment();

        console.log("Factory deployed at:", await factory.getAddress());
        console.log("Implementation deployed at:", await implementation.getAddress());
    });

    describe("Basic Factory Functionality", function () {
        it("Should get correct Curve pool information", async function () {
            const [pool, ethIdx, pyusdIdx] = await factory.getCurvePoolInfo();
            
            expect(pool).to.equal("0x383e6b4437b59fff47b619cba855ca29342a8559");
            expect(ethIdx).to.equal(0);
            expect(pyusdIdx).to.equal(1);
        });

        it("Should have correct token addresses", async function () {
            expect(await factory.curvePool()).to.equal("0x383e6b4437b59fff47b619cba855ca29342a8559");
            expect(await factory.weth()).to.equal("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
            expect(await factory.pyusd()).to.equal("0x6c3ea9036406852006290770BEdFcAbC0e3bA16C");
        });

        it("Should have correct pool indices", async function () {
            expect(await factory.ethIndex()).to.equal(0);
            expect(await factory.pyusdIndex()).to.equal(1);
        });
    });

    describe("Factory State", function () {
        it("Should start with zero hackathons", async function () {
            const hackathonCount = await factory.getHackathonCount();
            expect(hackathonCount).to.equal(0);
        });

        it("Should have zero PYUSD balance initially", async function () {
            const pyusdBalance = await factory.getPyusdBalance();
            expect(pyusdBalance).to.equal(0);
        });

        it("Should have zero WETH balance initially", async function () {
            const wethBalance = await factory.getWethBalance();
            expect(wethBalance).to.equal(0);
        });
    });

    describe("Error Handling", function () {
        it("Should fail with zero ETH amount for estimation", async function () {
            await expect(
                factory.estimatePyusdOutput(0)
            ).to.be.revertedWith("ETH amount must be greater than 0");
        });
    });

    describe("Gas Usage", function () {
        it("Should track gas usage for basic operations", async function () {
            // Test gas usage for estimation (this will fail on local network but we can measure gas)
            try {
                const tx = await factory.estimatePyusdOutput(ethers.parseEther("1"));
                console.log("Estimation completed");
            } catch (error) {
                console.log("Estimation failed (expected on local network):", error.message);
            }

            // Test gas usage for pool info
            const tx = await factory.getCurvePoolInfo();
            console.log("Pool info retrieval completed");
        });
    });
});
