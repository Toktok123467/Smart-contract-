const hre = require("hardhat");

async function main() {
  console.log("Starting deployment process for Soneium contracts...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Token parameters
  const tokenName = "Soneium Vote Token";
  const tokenSymbol = "SNTV";
  const tokenDecimals = 18;
  const initialSupply = "1000000000000000000000000"; // 1 million tokens with 18 decimals
  const rewardRate = "100000000000000000"; // 0.1 tokens per second with 18 decimals

  // Deploy the SoneiumVoteToken contract
  console.log("Deploying SoneiumVoteToken...");
  const SoneiumVoteToken = await hre.ethers.getContractFactory("SoneiumVoteToken");
  const soneiumVoteToken = await SoneiumVoteToken.deploy(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    initialSupply
  );
  await soneiumVoteToken.waitForDeployment();
  
  const tokenAddress = await soneiumVoteToken.getAddress();
  console.log(`SoneiumVoteToken deployed to: ${tokenAddress}`);

  // Deploy the VoteTokenRewarder contract
  console.log("Deploying VoteTokenRewarder...");
  const VoteTokenRewarder = await hre.ethers.getContractFactory("VoteTokenRewarder");
  const voteTokenRewarder = await VoteTokenRewarder.deploy(
    tokenAddress,
    rewardRate
  );
  await voteTokenRewarder.waitForDeployment();
  
  const rewarderAddress = await voteTokenRewarder.getAddress();
  console.log(`VoteTokenRewarder deployed to: ${rewarderAddress}`);

  // Verify deployment information
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`Token Name: ${await soneiumVoteToken.name()}`);
  console.log(`Token Symbol: ${await soneiumVoteToken.symbol()}`);
  console.log(`Token Decimals: ${await soneiumVoteToken.decimals()}`);
  console.log(`Total Supply: ${await soneiumVoteToken.totalSupply()} (raw units)`);
  console.log(`Token Owner: ${await soneiumVoteToken.owner()}`);
  console.log(`Rewarder linked to token: ${await voteTokenRewarder.voteToken()}`);
  console.log(`Reward Rate: ${await voteTokenRewarder.rewardRate()} (raw units per second)`);
  console.log(`Rewarder Owner: ${await voteTokenRewarder.owner()}`);

  console.log("\nPerforming initial setup...");
  
  // Transfer some tokens to rewarder for testing rewards
  const transferAmount = "100000000000000000000000"; // 100,000 tokens
  console.log(`Transferring ${transferAmount} tokens to rewarder contract...`);
  const transferTx = await soneiumVoteToken.transfer(rewarderAddress, transferAmount);
  await transferTx.wait();
  
  console.log("Checking rewarder token balance...");
  const rewarderBalance = await soneiumVoteToken.balanceOf(rewarderAddress);
  console.log(`Rewarder contract has ${rewarderBalance} tokens`);

  console.log("\nDeployment and setup completed successfully!");
  console.log(`SoneiumVoteToken: ${tokenAddress}`);
  console.log(`VoteTokenRewarder: ${rewarderAddress}`);
  
  // Contract verification instructions
  console.log("\nTo verify contracts on Etherscan:");
  console.log(`npx hardhat verify --network <network-name> ${tokenAddress} "${tokenName}" "${tokenSymbol}" ${tokenDecimals} ${initialSupply}`);
  console.log(`npx hardhat verify --network <network-name> ${rewarderAddress} ${tokenAddress} ${rewardRate}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
