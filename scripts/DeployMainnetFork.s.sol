// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

/**
 * @title DeployMainnetForkScript
 * @dev Deployment script for testing on mainnet fork
 */
contract DeployMainnetForkScript is Script {
    // Mainnet addresses
    address constant CURVE_POOL = 0x383e6b4437b59fff47b619cba855ca29342a8559;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbC0e3bA16C;
    
    // Curve pool indices (these need to be verified)
    int128 constant ETH_INDEX = 0;
    int128 constant PYUSD_INDEX = 1;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts on mainnet fork...");
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Hackathon implementation
        Hackathon implementation = new Hackathon();
        console.log("Hackathon implementation deployed at:", address(implementation));
        
        // Deploy HackathonFactory with Curve integration
        HackathonFactory factory = new HackathonFactory(
            address(implementation),
            CURVE_POOL,
            WETH,
            PYUSD,
            ETH_INDEX,
            PYUSD_INDEX
        );
        console.log("HackathonFactory deployed at:", address(factory));
        
        // Verify deployment
        console.log("Verifying deployment...");
        console.log("Curve pool:", factory.curvePool());
        console.log("WETH:", factory.weth());
        console.log("PYUSD:", factory.pyusd());
        console.log("ETH index:", factory.ethIndex());
        console.log("PYUSD index:", factory.pyusdIndex());
        
        // Test basic functionality
        console.log("Testing basic functionality...");
        
        // Test estimation
        uint256 testEth = 1 ether;
        uint256 estimate = factory.estimatePyusdOutput(testEth);
        console.log("1 ETH estimated to yield:", estimate, "PYUSD");
        
        // Test pool info
        (address pool, int128 ethIdx, int128 pyusdIdx) = factory.getCurvePoolInfo();
        console.log("Pool info - Pool:", pool, "ETH index:", ethIdx, "PYUSD index:", pyusdIdx);
        
        vm.stopBroadcast();
        
        console.log("Deployment completed successfully!");
        console.log("Factory address:", address(factory));
        console.log("Implementation address:", address(implementation));
    }
}
