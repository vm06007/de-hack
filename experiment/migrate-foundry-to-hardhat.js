#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class FoundryToHardhatMigrator {
  constructor(foundryPath, hardhatPath) {
    this.foundryPath = path.resolve(foundryPath);
    this.hardhatPath = path.resolve(hardhatPath);
  }

  async migrate() {
    try {
      log('🚀 Starting Foundry to Hardhat migration...', 'blue');

      // Step 1: Validate paths
      this.validatePaths();

      // Step 2: Initialize Hardhat project
      await this.initializeHardhat();

      // Step 3: Parse Foundry config
      const foundryConfig = this.parseFoundryConfig();

      // Step 4: Migrate contracts
      this.migrateContracts(foundryConfig);

      // Step 5: Migrate tests
      this.migrateTests();

      // Step 6: Migrate scripts
      this.migrateScripts();

      // Step 7: Update dependencies
      this.updateDependencies(foundryConfig);

      // Step 8: Create Hardhat config
      this.createHardhatConfig(foundryConfig);

      // Step 9: Create helper scripts
      this.createHelperScripts();

      log('✅ Migration completed successfully!', 'green');
      log('📝 Next steps:', 'yellow');
      log('  1. cd ' + this.hardhatPath, 'yellow');
      log('  2. npm install', 'yellow');
      log('  3. npx hardhat compile', 'yellow');
      log('  4. npx hardhat test', 'yellow');

    } catch (error) {
      log(`❌ Migration failed: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  validatePaths() {
    if (!fs.existsSync(this.foundryPath)) {
      throw new Error(`Foundry project not found at: ${this.foundryPath}`);
    }

    if (!fs.existsSync(path.join(this.foundryPath, 'foundry.toml'))) {
      throw new Error(`No foundry.toml found. Is this a Foundry project?`);
    }

    if (!fs.existsSync(this.hardhatPath)) {
      fs.mkdirSync(this.hardhatPath, { recursive: true });
    }
  }

  async initializeHardhat() {
    log('📦 Initializing Hardhat project...', 'blue');

    // Create package.json
    const packageJson = {
      name: "hardhat-project",
      version: "1.0.0",
      description: "Migrated from Foundry",
      type: "commonjs",
      scripts: {
        "compile": "hardhat compile",
        "test": "hardhat test",
        "test:coverage": "hardhat coverage",
        "deploy": "hardhat run scripts/deploy.js",
        "node": "hardhat node",
        "console": "hardhat console",
        "clean": "hardhat clean"
      },
      devDependencies: {
        "hardhat": "^3.0.0",
        "@nomicfoundation/hardhat-toolbox": "^5.0.0",
        "@nomicfoundation/hardhat-ethers": "^3.0.0",
        "@nomicfoundation/hardhat-verify": "^2.0.0",
        "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
        "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
        "@nomicfoundation/hardhat-viem": "^3.0.0",
        "@typechain/ethers-v6": "^0.5.0",
        "@typechain/hardhat": "^9.0.0",
        "@types/chai": "^4.2.0",
        "@types/mocha": ">=9.1.0",
        "chai": "^4.2.0",
        "ethers": "^6.4.0",
        "viem": "^2.0.0",
        "hardhat-gas-reporter": "^1.0.8",
        "solidity-coverage": "^0.8.0",
        "typechain": "^8.3.0",
        "@openzeppelin/contracts": "^5.0.0"
      }
    };

    fs.writeFileSync(
      path.join(this.hardhatPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  parseFoundryConfig() {
    log('🔍 Parsing Foundry configuration...', 'blue');

    const configPath = path.join(this.foundryPath, 'foundry.toml');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Basic TOML parsing (for common settings)
    const config = {
      src: 'src',
      test: 'test',
      script: 'script',
      solc_version: '0.8.23',
      optimizer: true,
      optimizer_runs: 200,
      remappings: []
    };

    // Parse src directory
    const srcMatch = configContent.match(/src\s*=\s*['"](.+?)['"]/);
    if (srcMatch) config.src = srcMatch[1];

    // Parse test directory
    const testMatch = configContent.match(/test\s*=\s*['"](.+?)['"]/);
    if (testMatch) config.test = testMatch[1];

    // Parse script directory
    const scriptMatch = configContent.match(/script\s*=\s*['"](.+?)['"]/);
    if (scriptMatch) config.script = scriptMatch[1];

    // Parse solc version
    const solcMatch = configContent.match(/solc_version\s*=\s*['"](.+?)['"]/);
    if (solcMatch) config.solc_version = solcMatch[1];

    // Parse optimizer
    const optimizerMatch = configContent.match(/optimizer\s*=\s*(.+)/);
    if (optimizerMatch) config.optimizer = optimizerMatch[1] === 'true';

    // Parse optimizer runs
    const runsMatch = configContent.match(/optimizer_runs\s*=\s*(\d+)/);
    if (runsMatch) config.optimizer_runs = parseInt(runsMatch[1]);

    // Parse remappings
    const remappingsPath = path.join(this.foundryPath, 'remappings.txt');
    if (fs.existsSync(remappingsPath)) {
      config.remappings = fs.readFileSync(remappingsPath, 'utf-8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    }

    return config;
  }

  migrateContracts(config) {
    log('📄 Migrating contracts...', 'blue');

    const srcPath = path.join(this.foundryPath, config.src);
    const destPath = path.join(this.hardhatPath, 'contracts');

    if (fs.existsSync(srcPath)) {
      this.copyDirectory(srcPath, destPath);
      log(`  ✓ Copied ${config.src} to contracts`, 'green');
    }
  }

  migrateTests() {
    log('🧪 Migrating tests...', 'blue');

    const testSrcPath = path.join(this.foundryPath, 'test');
    const testDestPath = path.join(this.hardhatPath, 'test');

    if (fs.existsSync(testSrcPath)) {
      fs.mkdirSync(testDestPath, { recursive: true });

      // Get all test files
      const testFiles = this.getAllFiles(testSrcPath, '.sol');

      testFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const convertedContent = this.convertFoundryTestToHardhat3(content);

        // Keep .sol extension but update filename convention for Hardhat 3.0
        const relativePath = path.relative(testSrcPath, file);
        const newFileName = relativePath.replace('.t.sol', '.test.sol');
        const destFile = path.join(testDestPath, newFileName);

        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.writeFileSync(destFile, convertedContent);
        log(`  ✓ Migrated ${path.basename(file)} to Hardhat 3.0 Solidity test`, 'green');
      });
    }
  }

  migrateScripts() {
    log('📜 Migrating scripts...', 'blue');

    const scriptSrcPath = path.join(this.foundryPath, 'script');
    const scriptDestPath = path.join(this.hardhatPath, 'scripts');

    if (fs.existsSync(scriptSrcPath)) {
      fs.mkdirSync(scriptDestPath, { recursive: true });

      // Get all script files
      const scriptFiles = this.getAllFiles(scriptSrcPath, '.s.sol');

      scriptFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const convertedContent = this.convertFoundryScriptToHardhat(content);

        // Change filename from .s.sol to .js
        const relativePath = path.relative(scriptSrcPath, file);
        const newFileName = relativePath.replace('.s.sol', '.js').replace('.sol', '.js');
        const destFile = path.join(scriptDestPath, newFileName);

        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.writeFileSync(destFile, convertedContent);
        log(`  ✓ Converted ${path.basename(file)} to Hardhat script`, 'green');
      });
    }

    // Create a basic deploy script if none exists
    const deployScriptPath = path.join(scriptDestPath, 'deploy.js');
    if (!fs.existsSync(deployScriptPath)) {
      fs.writeFileSync(deployScriptPath, this.getBasicDeployScript());
      log('  ✓ Created basic deploy.js script', 'green');
    }
  }

  updateDependencies(config) {
    log('📚 Updating dependencies...', 'blue');

    // Check for OpenZeppelin
    const libPath = path.join(this.foundryPath, 'lib');
    if (fs.existsSync(libPath)) {
      const libs = fs.readdirSync(libPath);

      const packageJsonPath = path.join(this.hardhatPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if (libs.includes('openzeppelin-contracts')) {
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies['@openzeppelin/contracts'] = '^5.0.0';
        log('  ✓ Added OpenZeppelin contracts dependency', 'green');
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  createHardhatConfig(foundryConfig) {
    log('⚙️  Creating Hardhat configuration...', 'blue');

    const hardhatConfig = `require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "${foundryConfig.solc_version}",
    settings: {
      optimizer: {
        enabled: ${foundryConfig.optimizer},
        runs: ${foundryConfig.optimizer_runs}
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  },
  // Hardhat 3.0 native Solidity testing support
  testing: {
    solidity: {
      enabled: true
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    scripts: "./scripts",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
`;

    fs.writeFileSync(
      path.join(this.hardhatPath, 'hardhat.config.js'),
      hardhatConfig
    );

    // Create .env.example
    const envExample = `# Network RPC URLs
MAINNET_RPC_URL=
SEPOLIA_RPC_URL=

# Private keys
PRIVATE_KEY=

# Etherscan API key for verification
ETHERSCAN_API_KEY=
`;

    fs.writeFileSync(
      path.join(this.hardhatPath, '.env.example'),
      envExample
    );

    log('  ✓ Created hardhat.config.js', 'green');
  }

  createHelperScripts() {
    log('🛠️  Creating helper scripts...', 'blue');

    // Create README
    const readme = `# Hardhat 3.0 Project (Migrated from Foundry)

This project has been migrated from Foundry to Hardhat 3.0, which now supports native Solidity testing!

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

### Compile contracts
\`\`\`bash
npx hardhat compile
\`\`\`

### Run Solidity tests (Hardhat 3.0 native support)
\`\`\`bash
npx hardhat test
\`\`\`

### Run tests with coverage
\`\`\`bash
npx hardhat coverage
\`\`\`

### Deploy contracts
\`\`\`bash
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

### Start local node
\`\`\`bash
npx hardhat node
\`\`\`

## Migration Notes

✅ **Hardhat 3.0 Benefits:**
- Native Solidity test support - your Foundry tests can run with minimal changes!
- Improved performance and developer experience
- Better integration with existing Solidity tooling

📝 **Post-Migration Steps:**
- Review migrated Solidity tests in the \`test/\` directory
- Update any Foundry-specific imports (marked with TODO comments)
- Foundry scripts have been converted to Hardhat deployment scripts
- Test your contracts: \`npx hardhat test\`

## Foundry → Hardhat 3.0 Changes

- \`forge-std/Test.sol\` → \`hardhat/test.sol\`
- \`forge-std/console.sol\` → \`hardhat/console.sol\`
- Test files: \`.t.sol\` → \`.test.sol\`
- Most Foundry test patterns work unchanged!
`;

    fs.writeFileSync(
      path.join(this.hardhatPath, 'README.md'),
      readme
    );

    log('  ✓ Created README.md', 'green');
  }

  // Helper methods

  copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  getAllFiles(dir, extension) {
    const files = [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extension));
      } else if (entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  convertFoundryTestToHardhat3(foundryTest) {
    // For Hardhat 3.0, we can preserve most of the Foundry test structure
    // Just need to update imports and make minimal changes for compatibility

    // Replace Foundry-specific imports with Hardhat 3.0 equivalents
    let convertedTest = foundryTest;

    // Replace forge-std imports
    convertedTest = convertedTest.replace(
      /import\s+[^;]*forge-std\/Test\.sol[^;]*;/g,
      'import {Test} from "hardhat/test.sol";'
    );

    convertedTest = convertedTest.replace(
      /import\s+[^;]*forge-std\/console\.sol[^;]*;/g,
      'import {console} from "hardhat/console.sol";'
    );

    // Replace other common forge-std imports
    convertedTest = convertedTest.replace(
      /import\s+[^;]*forge-std\/[^;]*;/g,
      '// TODO: Review and update forge-std imports for Hardhat 3.0'
    );

    // Fix contract import paths (from ../src/ to ../contracts/)
    convertedTest = convertedTest.replace(
      /import\s+([^;]*)"\.\.\/src\/([^"]*)"([^;]*);/g,
      'import $1"../contracts/$2"$3;'
    );

    // Add Hardhat 3.0 test pragma if missing
    if (!convertedTest.includes('pragma solidity')) {
      convertedTest = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

${convertedTest}`;
    }

    // Add comment about migration
    const migrationComment = `// Migrated from Foundry to Hardhat 3.0
// Review and update any Foundry-specific functionality
// Hardhat 3.0 supports native Solidity testing

`;

    return migrationComment + convertedTest;
  }

  convertFoundryScriptToHardhat(foundryScript) {
    return `const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // TODO: Add your deployment logic here
  // Example:
  /*
  const Contract = await hre.ethers.getContractFactory("YourContract");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
  */

  // Original Foundry script for reference:
  /*
${foundryScript}
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
  }

  getBasicDeployScript() {
    return `const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = hre.ethers.parseEther("0.001");

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.waitForDeployment();

  console.log(
    \`Lock with 1 ETH and unlock timestamp \${unlockTime} deployed to \${await lock.getAddress()}\`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node migrate-foundry-to-hardhat.js <foundry-project-path> <hardhat-project-path>');
    console.log('Example: node migrate-foundry-to-hardhat.js ./foundry-project ./hardhat-project');
    process.exit(1);
  }

  const migrator = new FoundryToHardhatMigrator(args[0], args[1]);
  migrator.migrate();
}

export default FoundryToHardhatMigrator;