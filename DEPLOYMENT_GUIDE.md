# 🚀 HackathonFactory with Curve Finance Integration - Deployment Guide

## 📋 Overview

This guide covers deploying the updated HackathonFactory contract with Curve Finance integration for ETH to PYUSD conversion.

## 🔧 Prerequisites

1. **Environment Variables**: Set up your `.env` file with:
   ```bash
   MAINNET_PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

2. **Dependencies**: Ensure all dependencies are installed:
   ```bash
   bun install
   ```

## 🏗️ Deployment Options

### Option 1: Local Testing (Recommended First)
```bash
# Deploy to local Hardhat network
bun run deploy:factory:local
```

### Option 2: Mainnet Deployment
```bash
# Deploy to mainnet with Curve Finance integration
bun run deploy:factory:curve
```

### Option 3: Manual Deployment
```bash
# Using Hardhat Ignition directly
npx hardhat ignition deploy ignition/modules/HackathonFactory.ts --network mainnet --reset
```

## 📦 What Gets Deployed

### 1. Hackathon Implementation Contract
- **Purpose**: Template contract for hackathon instances
- **Constructor**: No parameters required
- **Features**: Core hackathon functionality

### 2. HackathonFactory Contract
- **Purpose**: Factory for creating hackathon instances with Curve Finance integration
- **Constructor Parameters**:
  - `implementation`: Address of the Hackathon implementation
  - `_curvePool`: Curve Finance pool address (`0x383E6b4437b59fff47B619CBA855CA29342A8559`)
  - `_weth`: WETH token address (`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`)
  - `_pyusd`: PYUSD token address (`0x6C3ea9036406852006290770BeDfcAbc0E3ba16C`)
  - `_ethIndex`: ETH index in Curve pool (`0`)
  - `_pyusdIndex`: PYUSD index in Curve pool (`1`)

## 🔍 Verification

After deployment, verify the contracts:

```bash
# Verify the contracts
bun run verify:factory
```

This will verify both the implementation and factory contracts with the correct constructor parameters.

## 📊 Deployment Output

After successful deployment, you'll see:

```
Deployed Addresses
HackathonFactoryModule#Hackathon - 0x[implementation_address]
HackathonFactoryModule#HackathonFactory - 0x[factory_address]
```

## 🌐 Mainnet Addresses

### Curve Finance Integration
- **Curve Pool**: `0x383E6b4437b59fff47B619CBA855CA29342A8559`
- **WETH**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- **PYUSD**: `0x6C3ea9036406852006290770BeDfcAbc0E3ba16C`

### Pool Indices
- **ETH Index**: `0`
- **PYUSD Index**: `1`

## 🧪 Testing

### Local Testing
```bash
# Run Curve integration tests
npx hardhat test test/CurveIntegrationTest.sol --network hardhat
```

### Mainnet Fork Testing
```bash
# Test against mainnet fork
npx hardhat test test/CurveIntegrationTest.sol --network hardhat
```

## 📝 Usage After Deployment

### Creating a Hackathon with ETH to PYUSD Conversion

```solidity
// Example: Create hackathon with 2 ETH prize pool
uint256 prizePoolEth = 2 ether;
uint256 minPyusdOut = 3000 * 1e6; // 3000 PYUSD minimum

factory.createHackathon{value: prizePoolEth}(
    hackathonId,
    startTime,
    endTime,
    minimumSponsorContribution,
    stakeAmount,
    prizeDistribution,
    selectedJudges,
    votingConfig,
    minPyusdOut
);
```

### Key Features

1. **Automatic ETH to PYUSD Conversion**: Factory converts ETH to PYUSD using Curve Finance
2. **Slippage Protection**: Specify minimum PYUSD output
3. **Gas Efficient**: Uses Curve's direct ETH handling
4. **Secure**: Emergency functions for global judges

## 🔧 Troubleshooting

### Stack Too Deep Error
If you encounter "Stack too deep" errors:
1. Ensure `viaIR: true` is enabled in `hardhat.config.ts` ✅
2. The contract has been optimized to reduce stack depth ✅

### Compilation Issues
```bash
# Clean and recompile
rm -rf artifacts cache
npx hardhat compile
```

### Deployment Issues
```bash
# Reset and redeploy
npx hardhat ignition deploy ignition/modules/HackathonFactory.ts --network mainnet --reset
```

## 📈 Gas Optimization

The contract has been optimized for:
- ✅ Reduced stack depth
- ✅ Efficient Curve integration
- ✅ Minimal gas usage for hackathon creation
- ✅ Optimized for mainnet deployment

## 🎯 Next Steps

1. **Deploy to Mainnet**: Use `bun run deploy:factory:curve`
2. **Verify Contracts**: Use `bun run verify:factory`
3. **Test Integration**: Run comprehensive tests
4. **Monitor Gas Usage**: Track deployment and transaction costs

## 📞 Support

For issues or questions:
- Check the test suite: `test/CurveIntegrationTest.sol`
- Review the contract: `contracts/HackathonFactory.sol`
- Run diagnostics: `npx hardhat test`

---

**Ready to deploy! 🚀**
