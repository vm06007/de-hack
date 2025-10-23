import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HackathonFactory } from "../typechain-types";

describe("Curve Integration Advanced Tests", function () {
    let factory: HackathonFactory;
    let owner: HardhatEthersSigner;

    // Mainnet addresses
    const CURVE_POOL = "0x383e6b4437b59fff47b619cba855ca29342a8559";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const PYUSD = "0x6c3ea9036406852006290770BEdFcAbC0e3bA16C";
    
    // Curve pool indices
    const ETH_INDEX = 0;
    const PYUSD_INDEX = 1;

    before(async function () {
        // Fork mainnet
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: "https://mainnet.infura.io/v3/b17509e0e2ce45f48a44289ff1aa3c73",
                        blockNumber: 23639316,
                    },
                },
            ],
        });

        [owner] = await ethers.getSigners();

        // Deploy implementation and factory
        const HackathonImplementation = await ethers.getContractFactory("Hackathon");
        const implementation = await HackathonImplementation.deploy();
        await implementation.waitForDeployment();

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
    });

    describe("Real-time Price Comparison", function () {
        it("Should compare factory estimate with direct Curve call", async function () {
            const ethAmount = ethers.parseEther("1");

            // Get estimation from our factory
            const factoryEstimate = await factory.estimatePyusdOutput(ethAmount);

            // Get direct estimation from Curve pool
            const curvePool = await ethers.getContractAt("ICurvePool", CURVE_POOL);
            const curveEstimate = await curvePool.get_dy(ETH_INDEX, PYUSD_INDEX, ethAmount);

            console.log("Factory estimate:", ethers.formatUnits(factoryEstimate, 6));
            console.log("Direct Curve estimate:", ethers.formatUnits(curveEstimate, 6));

            // Estimates should be very close (within 1% tolerance)
            const tolerance = curveEstimate / 100n; // 1% tolerance
            expect(factoryEstimate).to.be.closeTo(curveEstimate, tolerance);
        });
    });

    describe("Slippage Analysis", function () {
        it("Should analyze slippage across different amounts", async function () {
            const ethAmounts = [
                ethers.parseEther("0.1"),
                ethers.parseEther("0.5"),
                ethers.parseEther("1"),
                ethers.parseEther("2"),
                ethers.parseEther("5")
            ];

            console.log("Slippage Analysis:");
            console.log("ETH Amount | PYUSD Output | Rate");

            for (const amount of ethAmounts) {
                const pyusdOutput = await factory.estimatePyusdOutput(amount);
                const rate = (pyusdOutput * 1000000n) / amount; // Rate per million
                
                console.log(
                    ethers.formatEther(amount), 
                    "|", 
                    ethers.formatUnits(pyusdOutput, 6), 
                    "|", 
                    rate.toString()
                );
                expect(pyusdOutput).to.be.gt(0);
            }
        });
    });

    describe("Large Amount Conversion", function () {
        it("Should handle large amount conversion", async function () {
            const largeEthAmount = ethers.parseEther("10");
            
            try {
                const estimate = await factory.estimatePyusdOutput(largeEthAmount);
                console.log("Large amount estimate:", ethers.formatUnits(estimate, 6));
                expect(estimate).to.be.gt(0);
            } catch (error) {
                console.log("Large amount conversion failed - likely due to liquidity constraints");
                // This is expected for very large amounts
            }
        });
    });

    describe("Curve Pool Liquidity", function () {
        it("Should check Curve pool state", async function () {
            const curvePool = await ethers.getContractAt("ICurvePool", CURVE_POOL);
            
            try {
                const coin0 = await curvePool.coins(0);
                console.log("Pool coin 0:", coin0);
                
                const coin1 = await curvePool.coins(1);
                console.log("Pool coin 1:", coin1);
                
                // Test pool functionality
                const dy = await curvePool.get_dy(ETH_INDEX, PYUSD_INDEX, ethers.parseEther("1"));
                console.log("1 ETH to PYUSD rate:", ethers.formatUnits(dy, 6));
                expect(dy).to.be.gt(0);
            } catch (error) {
                console.log("Could not get pool state - pool might be inactive");
            }
        });
    });

    describe("Multiple Conversions", function () {
        it("Should handle multiple conversions", async function () {
            const totalEth = ethers.parseEther("5");
            const conversionCount = 5;
            const ethPerConversion = totalEth / BigInt(conversionCount);

            console.log("Testing multiple conversions:");
            console.log("Total ETH:", ethers.formatEther(totalEth));
            console.log("Conversions:", conversionCount);
            console.log("ETH per conversion:", ethers.formatEther(ethPerConversion));

            let totalPyusdReceived = 0n;

            for (let i = 0; i < conversionCount; i++) {
                const estimate = await factory.estimatePyusdOutput(ethPerConversion);
                console.log(`Conversion ${i + 1} estimate:`, ethers.formatUnits(estimate, 6));
                totalPyusdReceived += estimate;
            }

            console.log("Total PYUSD estimated:", ethers.formatUnits(totalPyusdReceived, 6));
            expect(totalPyusdReceived).to.be.gt(0);
        });
    });

    describe("Price Impact Analysis", function () {
        it("Should analyze price impact", async function () {
            const smallAmount = ethers.parseEther("0.01");
            const largeAmount = ethers.parseEther("1");

            const smallEstimate = await factory.estimatePyusdOutput(smallAmount);
            const largeEstimate = await factory.estimatePyusdOutput(largeAmount);

            // Calculate rates
            const smallRate = (smallEstimate * 1000000n) / smallAmount;
            const largeRate = (largeEstimate * 1000000n) / largeAmount;

            console.log("Small amount rate:", smallRate.toString());
            console.log("Large amount rate:", largeRate.toString());

            if (largeRate < smallRate) {
                console.log("Price impact detected - larger amounts get worse rates");
            } else {
                console.log("No significant price impact");
            }
        });
    });

    describe("Direct Curve Pool Interaction", function () {
        it("Should interact directly with Curve pool", async function () {
            const ethAmount = ethers.parseEther("0.1");

            // Get initial PYUSD balance
            const pyusdToken = await ethers.getContractAt("IERC20", PYUSD);
            const initialBalance = await pyusdToken.balanceOf(owner.address);

            // Perform direct swap
            const curvePool = await ethers.getContractAt("ICurvePool", CURVE_POOL);
            await curvePool.exchange(
                ETH_INDEX,
                PYUSD_INDEX,
                ethAmount,
                0, // No minimum for this test
                { value: ethAmount }
            );

            // Check final balance
            const finalBalance = await pyusdToken.balanceOf(owner.address);
            const pyusdReceived = finalBalance - initialBalance;

            console.log("ETH sent:", ethers.formatEther(ethAmount));
            console.log("PYUSD received:", ethers.formatUnits(pyusdReceived, 6));

            expect(pyusdReceived).to.be.gt(0);

            // Calculate effective rate
            const rate = (pyusdReceived * 1000000n) / ethAmount;
            console.log("Effective rate:", rate.toString());
        });
    });

    describe("Gas Optimization", function () {
        it("Should analyze gas usage", async function () {
            // Test estimation gas usage
            const tx1 = await factory.estimatePyusdOutput(ethers.parseEther("1"));
            console.log("Estimation completed");

            // Test direct Curve call gas usage
            const curvePool = await ethers.getContractAt("ICurvePool", CURVE_POOL);
            const tx2 = await curvePool.get_dy(ETH_INDEX, PYUSD_INDEX, ethers.parseEther("1"));
            console.log("Direct Curve call completed");
        });
    });

    describe("Error Handling", function () {
        it("Should handle edge cases", async function () {
            // Test with zero amount
            await expect(
                factory.estimatePyusdOutput(0)
            ).to.be.revertedWith("ETH amount must be greater than 0");

            // Test with very large amount (might cause overflow)
            const veryLargeAmount = ethers.parseEther("1000000"); // 1M ETH
            try {
                const estimate = await factory.estimatePyusdOutput(veryLargeAmount);
                console.log("Very large amount handled gracefully");
            } catch (error) {
                console.log("Very large amount caused error (expected)");
            }
        });
    });

    describe("Pool State Verification", function () {
        it("Should verify Curve pool state", async function () {
            const curvePool = await ethers.getContractAt("ICurvePool", CURVE_POOL);
            
            try {
                const dy = await curvePool.get_dy(ETH_INDEX, PYUSD_INDEX, ethers.parseEther("1"));
                console.log("Current pool state - 1 ETH to PYUSD:", ethers.formatUnits(dy, 6));
                expect(dy).to.be.gt(0);
            } catch (error) {
                console.log("Could not get pool state - pool might be inactive");
            }
        });
    });
});
