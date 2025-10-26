# Hardhat 3.0 Project (Migrated from Foundry)

This project has been migrated from Foundry to Hardhat 3.0, which now supports native Solidity testing!

## Installation

```bash
npm install
```

## Usage

### Compile contracts
```bash
npx hardhat compile
```

### Run Solidity tests (Hardhat 3.0 native support)
```bash
npx hardhat test
```

### Run tests with coverage
```bash
npx hardhat coverage
```

### Deploy contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Start local node
```bash
npx hardhat node
```

## Migration Notes

✅ **Hardhat 3.0 Benefits:**
- Native Solidity test support - your Foundry tests can run with minimal changes!
- Improved performance and developer experience
- Better integration with existing Solidity tooling

📝 **Post-Migration Steps:**
- Review migrated Solidity tests in the `test/` directory
- Update any Foundry-specific imports (marked with TODO comments)
- Foundry scripts have been converted to Hardhat deployment scripts
- Test your contracts: `npx hardhat test`

## Foundry → Hardhat 3.0 Changes

- `forge-std/Test.sol` → `hardhat/test.sol`
- `forge-std/console.sol` → `hardhat/console.sol`
- Test files: `.t.sol` → `.test.sol`
- Most Foundry test patterns work unchanged!
