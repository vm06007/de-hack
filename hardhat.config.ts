import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-node-test-runner";
import "@nomicfoundation/hardhat-viem-assertions";
import "@nomicfoundation/hardhat-ignition";

const config: HardhatUserConfig = {
    plugins: [hardhatToolboxViemPlugin],
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1,
            },
        },
    },
    verify: {
        etherscan: {
            apiKey: configVariable("ETHERSCAN_API_KEY"),
        },
        blockscout: {
            enabled: true,
        },
    },
    networks: {
        hardhat: {
            type: "edr-simulated",
            chainType: "l1",
        },
        sepolia: {
            type: "http",
            chainType: "l1",
            url: configVariable("SEPOLIA_RPC_URL"),
            accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
        },
        mainnet: {
            type: "http",
            chainType: "l1",
            url: "https://1rpc.io/eth",
            accounts: [configVariable("MAINNET_PRIVATE_KEY")],
            gasPrice: "auto",
        },
        arbitrum: {
            type: "http",
            chainType: "generic",
            url: configVariable("ARBITRUM_RPC_URL"),
            accounts: [configVariable("ARBITRUM_PRIVATE_KEY")],
        },
        optimism: {
            type: "http",
            chainType: "op",
            url: configVariable("OPTIMISM_RPC_URL"),
            accounts: [configVariable("OPTIMISM_PRIVATE_KEY")],
        },
        polygon: {
            type: "http",
            chainType: "generic",
            url: configVariable("POLYGON_RPC_URL"),
            accounts: [configVariable("POLYGON_PRIVATE_KEY")],
        },
        base: {
            type: "http",
            chainType: "generic",
            url: configVariable("BASE_RPC_URL"),
            accounts: [configVariable("BASE_PRIVATE_KEY")],
        },
        hedera: {
            type: "http",
            chainType: "generic",
            url: configVariable("HEDERA_RPC_URL"),
            accounts: [configVariable("HEDERA_PRIVATE_KEY")],
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
