const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HackathonFactory Mainnet Fork Tests", function () {
    let factory;
    let hackathon;
    let owner;
    let organizer;
    let judge1;
    let judge2;
    let participant1;
    let participant2;

    // Mainnet addresses
    const CURVE_POOL = "0x383e6b4437b59fff47b619cba855ca29342a8559";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const PYUSD = "0x6c3ea9036406852006290770BEdFcAbC0e3bA16C";
    
    // Curve pool indices
    const ETH_INDEX = 0;
    const PYUSD_INDEX = 1;

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
        // Fork mainnet at a recent block
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: "https://mainnet.infura.io/v3/b17509e0e2ce45f48a44289ff1aa3c73",
                        blockNumber: 23639316, // Recent block
                    },
                },
            ],
        });

        // Get signers
        [owner, organizer, judge1, judge2, participant1, participant2] = await ethers.getSigners();

        // Deploy implementation contract
        const HackathonImplementation = await ethers.getContractFactory("Hackathon");
        const implementation = await HackathonImplementation.deploy();
        await implementation.waitForDeployment();

        // Deploy factory with Curve Finance integration
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

    describe("Curve Pool Integration", function () {
        it("Should get correct Curve pool information", async function () {
            const [pool, ethIdx, pyusdIdx] = await factory.getCurvePoolInfo();
            
            expect(pool).to.equal(CURVE_POOL);
            expect(ethIdx).to.equal(ETH_INDEX);
            expect(pyusdIdx).to.equal(PYUSD_INDEX);
        });

        it("Should estimate PYUSD output for ETH input", async function () {
            const ethAmount = ethers.parseEther("1");
            const estimatedPyusd = await factory.estimatePyusdOutput(ethAmount);
            
            console.log("Estimated PYUSD for 1 ETH:", estimatedPyusd.toString());
            expect(estimatedPyusd).to.be.gt(0);
            
            // The estimation should be reasonable
            expect(estimatedPyusd).to.be.lt(ethAmount * 10000n);
        });

        it("Should handle different ETH amounts", async function () {
            const amounts = [
                ethers.parseEther("0.1"),
                ethers.parseEther("0.5"),
                ethers.parseEther("1"),
                ethers.parseEther("2"),
                ethers.parseEther("5")
            ];

            console.log("Slippage Analysis:");
            console.log("ETH Amount | PYUSD Output | Rate");

            for (const amount of amounts) {
                const pyusdOutput = await factory.estimatePyusdOutput(amount);
                const rate = (pyusdOutput * 1000000n) / amount; // Rate per million
                
                console.log(ethers.formatEther(amount), "|", ethers.formatUnits(pyusdOutput, 6), "|", rate.toString());
                expect(pyusdOutput).to.be.gt(0);
            }
        });
    });

    describe("Hackathon Creation with Curve Conversion", function () {
        it("Should create hackathon with ETH to PYUSD conversion", async function () {
            const prizePoolEth = ethers.parseEther("2");
            const minPyusdOut = ethers.parseUnits("3000", 6); // 3000 PYUSD minimum

            // Get initial balances
            const initialEthBalance = await ethers.provider.getBalance(organizer.address);
            const initialPyusdBalance = await factory.getPyusdBalance();

            console.log("Initial ETH balance:", ethers.formatEther(initialEthBalance));
            console.log("Initial PYUSD balance:", ethers.formatUnits(initialPyusdBalance, 6));

            // Create hackathon
            const tx = await factory.connect(organizer).createHackathon(
                hackathonId,
                startTime,
                endTime,
                minimumSponsorContribution,
                stakeAmount,
                prizeDistribution,
                [judge1.address, judge2.address],
                {
                    systemType: 0, // VotingSystemType.OPEN
                    useQuadraticVoting: false,
                    votingPowerPerJudge: 100,
                    maxWinners: 3
                },
                minPyusdOut,
                { value: prizePoolEth }
            );

            const receipt = await tx.wait();
            console.log("Gas used for hackathon creation:", receipt?.gasUsed.toString());

            // Get the hackathon address from events
            const hackathonCreatedEvent = receipt?.logs.find(
                log => log.topics[0] === factory.interface.getEvent("HackathonCreated").topicHash
            );
            
            expect(hackathonCreatedEvent).to.not.be.undefined;
            
            // Verify hackathon was created
            const hackathonCount = await factory.getHackathonCount();
            expect(hackathonCount).to.equal(1);

            // Check PYUSD was transferred to hackathon
            const organizerHackathonCount = await factory.getOrganizerHackathonCount(organizer.address);
            expect(organizerHackathonCount).to.equal(1);

            const hackathonAddress = await factory.getOrganizerHackathon(organizer.address, 0);
            expect(hackathonAddress).to.not.equal(ethers.ZeroAddress);

            // Check PYUSD balance in hackathon
            const pyusdToken = await ethers.getContractAt("IERC20", PYUSD);
            const hackathonPyusdBalance = await pyusdToken.balanceOf(hackathonAddress);
            
            console.log("Hackathon PYUSD balance:", ethers.formatUnits(hackathonPyusdBalance, 6));
            expect(hackathonPyusdBalance).to.be.gt(0);
            expect(hackathonPyusdBalance).to.be.gte(minPyusdOut);

            // Verify the total prize distribution can be covered
            const totalPrizeDistribution = prizeDistribution.reduce((sum, amount) => sum + amount, 0n);
            expect(hackathonPyusdBalance).to.be.gte(totalPrizeDistribution);
        });

        it("Should fail with insufficient PYUSD output", async function () {
            const prizePoolEth = ethers.parseEther("0.001"); // Very small amount
            const minPyusdOut = ethers.parseUnits("10000", 6); // Unrealistically high minimum

            await expect(
                factory.connect(organizer).createHackathon(
                    hackathonId + 1,
                    startTime,
                    endTime,
                    minimumSponsorContribution,
                    stakeAmount,
                    prizeDistribution,
                    [judge1.address, judge2.address],
                    {
                        systemType: 0, // VotingSystemType.OPEN
                        useQuadraticVoting: false,
                        votingPowerPerJudge: 100,
                        maxWinners: 3
                    },
                    minPyusdOut,
                    { value: prizePoolEth }
                )
            ).to.be.revertedWith("Insufficient PYUSD output");
        });

        it("Should fail with insufficient PYUSD for prize distribution", async function () {
            const prizePoolEth = ethers.parseEther("0.01"); // Very small amount
            const minPyusdOut = 1n; // Very low minimum

            // Set up very high prize distribution
            const highPrizeDistribution = [ethers.parseUnits("100000", 6)]; // 100,000 PYUSD

            await expect(
                factory.connect(organizer).createHackathon(
                    hackathonId + 2,
                    startTime,
                    endTime,
                    minimumSponsorContribution,
                    stakeAmount,
                    highPrizeDistribution,
                    [judge1.address, judge2.address],
                    {
                        systemType: 0, // VotingSystemType.OPEN
                        useQuadraticVoting: false,
                        votingPowerPerJudge: 100,
                        maxWinners: 3
                    },
                    minPyusdOut,
                    { value: prizePoolEth }
                )
            ).to.be.revertedWith("Insufficient PYUSD amount for prize distribution");
        });
    });

    describe("Multiple Hackathons", function () {
        it("Should create multiple hackathons", async function () {
            const prizePoolEth = ethers.parseEther("1");
            const minPyusdOut = ethers.parseUnits("2000", 6);

            // Create first hackathon
            await factory.connect(organizer).createHackathon(
                3,
                startTime,
                endTime,
                minimumSponsorContribution,
                stakeAmount,
                prizeDistribution,
                [judge1.address, judge2.address],
                {
                    systemType: 0, // VotingSystemType.OPEN
                    useQuadraticVoting: false,
                    votingPowerPerJudge: 100,
                    maxWinners: 3
                },
                minPyusdOut,
                { value: prizePoolEth }
            );

            // Create second hackathon
            await factory.connect(organizer).createHackathon(
                4,
                startTime + 86400, // 1 day later
                endTime + 86400,
                minimumSponsorContribution,
                stakeAmount,
                prizeDistribution,
                [judge1.address, judge2.address],
                {
                    systemType: 0, // VotingSystemType.OPEN
                    useQuadraticVoting: false,
                    votingPowerPerJudge: 100,
                    maxWinners: 3
                },
                minPyusdOut,
                { value: prizePoolEth }
            );

            // Verify both hackathons were created
            const hackathonCount = await factory.getHackathonCount();
            expect(hackathonCount).to.equal(3); // 1 from previous test + 2 new ones

            const organizerHackathonCount = await factory.getOrganizerHackathonCount(organizer.address);
            expect(organizerHackathonCount).to.equal(3);
        });
    });

    describe("Emergency Functions", function () {
        it("Should allow emergency PYUSD withdrawal by global judges", async function () {
            // First create a hackathon to get some PYUSD in the factory
            const prizePoolEth = ethers.parseEther("1");
            const minPyusdOut = ethers.parseUnits("2000", 6);

            await factory.connect(organizer).createHackathon(
                5,
                startTime,
                endTime,
                minimumSponsorContribution,
                stakeAmount,
                prizeDistribution,
                [judge1.address, judge2.address],
                {
                    systemType: 0, // VotingSystemType.OPEN
                    useQuadraticVoting: false,
                    votingPowerPerJudge: 100,
                    maxWinners: 3
                },
                minPyusdOut,
                { value: prizePoolEth }
            );

            // Check PYUSD balance
            const pyusdBalance = await factory.getPyusdBalance();
            console.log("PYUSD balance in factory:", ethers.formatUnits(pyusdBalance, 6));

            // Only global judges can withdraw
            const initialJudgeBalance = await ethers.provider.getBalance(judge1.address);
            await factory.connect(judge1).emergencyWithdrawPyusd();
            const finalJudgeBalance = await ethers.provider.getBalance(judge1.address);

            // Verify PYUSD was withdrawn
            const finalPyusdBalance = await factory.getPyusdBalance();
            expect(finalPyusdBalance).to.equal(0);
        });

        it("Should not allow non-judges to withdraw", async function () {
            await expect(
                factory.connect(participant1).emergencyWithdrawPyusd()
            ).to.be.revertedWith("Only global judges can call this function");
        });
    });

    describe("Gas Usage Analysis", function () {
        it("Should track gas usage for hackathon creation", async function () {
            const prizePoolEth = ethers.parseEther("1");
            const minPyusdOut = ethers.parseUnits("2000", 6);

            const tx = await factory.connect(organizer).createHackathon(
                6,
                startTime,
                endTime,
                minimumSponsorContribution,
                stakeAmount,
                prizeDistribution,
                [judge1.address, judge2.address],
                {
                    systemType: 0, // VotingSystemType.OPEN
                    useQuadraticVoting: false,
                    votingPowerPerJudge: 100,
                    maxWinners: 3
                },
                minPyusdOut,
                { value: prizePoolEth }
            );

            const receipt = await tx.wait();
            const gasUsed = receipt?.gasUsed || 0n;
            
            console.log("Gas used for hackathon creation:", gasUsed.toString());
            
            // Gas usage should be reasonable (less than 1M gas)
            expect(gasUsed).to.be.lt(1000000n);
        });
    });
});
