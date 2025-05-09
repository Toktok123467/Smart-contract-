require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY } = process.env
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "minato",
  networks: {
    hardhat: {},
    minato: {
      url: "https://rpc.minato.soneium.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1946,
    },
  },
  sourcify: {
    enabled: true
  },
  etherscan: {
    apiKey: {
      minato: "NO API KEY",
    },
    customChains: [
      {
        network: "minato",
        chainId: 1946,
        urls: {
          apiURL: "https://soneium-minato.blockscout.com/api",
          browserURL: "https://soneium-minato.blockscout.com",
        },
      },
    ],
  },
};

