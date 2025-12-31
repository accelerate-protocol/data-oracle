import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import { configVariable, defineConfig } from "hardhat/config";
import * as dotenv from 'dotenv'
dotenv.config()

const ZERO_PRIVATE_KEY ='0x0000000000000000000000000000000000000000000000000000000000000000'
const INFURA_API_KEY = process.env.INFURA_API_KEY ?? ''
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY ?? ZERO_PRIVATE_KEY
const TESTNET_PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY ??  ZERO_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? ''
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY ?? ''

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin,
    hardhatViem,
    hardhatViemAssertions,
    hardhatNodeTestRunner,
    hardhatNetworkHelpers,
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
    npmFilesToBuild: [
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
    ],
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    mainnet: {
      type: "http",
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [MAINNET_PRIVATE_KEY]
    },
    bsc: {
      type: "http",
      chainId: 56,
      url: 'https://bsc-dataseed.binance.org/',
      accounts: [MAINNET_PRIVATE_KEY]
    },
    bscTestnet: {
      type: "http",
      chainId: 97,
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: [TESTNET_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      bsc: ETHERSCAN_API_KEY,
      bscTestnet: ETHERSCAN_API_KEY
   },
  },
});
