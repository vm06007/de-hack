const { ethers } = require("hardhat");

async function main() {
    console.log("Verifying deployment...");

    // New factory address
    const factoryAddress = "0xB9bD8d3C1640C34342C34590E561dCc46f71fae2";

    // Get the factory contract
    const factory = await ethers.getContractAt("HackathonFactory", factoryAddress);

    // Check factory info
    const [curveRouter, weth, pyusd] = await factory.getCurveRouterInfo();

    console.log("Factory Info:");
    console.log("Curve Router:", curveRouter);
    console.log("WETH:", weth);
    console.log("PYUSD:", pyusd);

    // Expected addresses
    const expectedCurveRouter = "0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e";
    const expectedWETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const expectedPYUSD = "0x6C3ea9036406852006290770BeDfcAbc0E3ba16C";

    console.log("\nVerification:");
    console.log("Curve Router matches:", curveRouter === expectedCurveRouter);
    console.log("WETH matches:", weth === expectedWETH);
    console.log("PYUSD matches:", pyusd === expectedPYUSD);

    if (curveRouter === expectedCurveRouter && weth === expectedWETH && pyusd === expectedPYUSD) {
        console.log("\nDeployment verification successful!");
        console.log("Factory address:", factoryAddress);
        console.log("Etherscan:", `https://etherscan.io/address/${factoryAddress}`);
    } else {
        console.log("\nDeployment verification failed!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
