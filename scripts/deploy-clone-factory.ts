import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Hackathon Implementation and Factory...");

    // Deploy the implementation contract first (no constructor needed)
    const Hackathon = await ethers.getContractFactory("Hackathon");
    const implementation = await Hackathon.deploy();
    await implementation.waitForDeployment();
    
    const implementationAddress = await implementation.getAddress();
    console.log("Hackathon implementation deployed to:", implementationAddress);

    // Deploy the factory with the implementation address
    const HackathonFactory = await ethers.getContractFactory("HackathonFactory");
    const factory = await HackathonFactory.deploy(implementationAddress);
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("HackathonFactory deployed to:", factoryAddress);

    // Verify the implementation address is set correctly
    const storedImplementation = await factory.implementation();
    console.log("Factory implementation address:", storedImplementation);
    
    if (storedImplementation.toLowerCase() === implementationAddress.toLowerCase()) {
        console.log("✅ Implementation address set correctly in factory");
    } else {
        console.log("❌ Implementation address mismatch!");
    }

    console.log("\nDeployment Summary:");
    console.log("==================");
    console.log("Implementation:", implementationAddress);
    console.log("Factory:", factoryAddress);
    console.log("\nTo create a hackathon, call factory.createHackathon() with the required parameters");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
