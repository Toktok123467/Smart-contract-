// Test file for SoneiumVoteToken.sol using JavaScript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoneiumVoteToken", function () {
  let SoneiumVoteToken;
  let soneiumVoteToken;
  let VoteTokenRewarder;
  let voteTokenRewarder;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const tokenName = "Soneium Vote Token";
  const tokenSymbol = "SNTV";
  const tokenDecimals = 18;
  const initialSupply = "1000000000000000000000000"; // 1 million tokens with 18 decimals
  const rewardRate = "100000000000000000"; // 0.1 tokens per second with 18 decimals

  beforeEach(async function () {
    // Get the signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy SoneiumVoteToken contract
    const SoneiumVoteTokenFactory = await ethers.getContractFactory("SoneiumVoteToken");
    soneiumVoteToken = await SoneiumVoteTokenFactory.deploy(
      tokenName, 
      tokenSymbol, 
      tokenDecimals, 
      initialSupply
    );
    await soneiumVoteToken.waitForDeployment();

    // Deploy VoteTokenRewarder contract
    const VoteTokenRewarderFactory = await ethers.getContractFactory("VoteTokenRewarder");
    voteTokenRewarder = await VoteTokenRewarderFactory.deploy(
      await soneiumVoteToken.getAddress(), 
      rewardRate
    );
    await voteTokenRewarder.waitForDeployment();
  });

  describe("Token Deployment", function () {
    it("Should set the right token name", async function () {
      expect(await soneiumVoteToken.name()).to.equal(tokenName);
    });

    it("Should set the right token symbol", async function () {
      expect(await soneiumVoteToken.symbol()).to.equal(tokenSymbol);
    });

    it("Should set the right decimals", async function () {
      expect(await soneiumVoteToken.decimals()).to.equal(tokenDecimals);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await soneiumVoteToken.balanceOf(owner.address);
      expect(await soneiumVoteToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the right owner", async function () {
      expect(await soneiumVoteToken.owner()).to.equal(owner.address);
    });
  });

  describe("Token Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await soneiumVoteToken.transfer(addr1.address, "50000000000000000000");
      const addr1Balance = await soneiumVoteToken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("50000000000000000000");

      // Transfer 20 tokens from addr1 to addr2
      await soneiumVoteToken.connect(addr1).transfer(addr2.address, "20000000000000000000");
      const addr2Balance = await soneiumVoteToken.balanceOf(addr2.address);
      expect(addr2Balance.toString()).to.equal("20000000000000000000");
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await soneiumVoteToken.balanceOf(owner.address);
      
      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        soneiumVoteToken.connect(addr1).transfer(owner.address, "1000000000000000000")
      ).to.be.revertedWithCustomError(soneiumVoteToken, "ERC20InsufficientBalance");

      // Owner balance shouldn't have changed
      expect(await soneiumVoteToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });

  describe("Token Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const initialSupply = await soneiumVoteToken.totalSupply();
      const mintAmount = "1000000000000000000000"; // 1000 tokens
      
      await soneiumVoteToken.mint(addr1.address, mintAmount);
      
      // Check total supply increased
      const newSupply = await soneiumVoteToken.totalSupply();
      expect(newSupply.toString()).to.equal(
        (BigInt(initialSupply.toString()) + BigInt(mintAmount)).toString()
      );
      
      // Check addr1 received the tokens
      const addr1Balance = await soneiumVoteToken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal(mintAmount);
    });

    it("Should not allow non-owners to mint tokens", async function () {
      await expect(
        soneiumVoteToken.connect(addr1).mint(addr2.address, "1000000000000000000000")
      ).to.be.revertedWithCustomError(soneiumVoteToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      // First transfer some tokens to addr1
      await soneiumVoteToken.transfer(addr1.address, "100000000000000000000");
      
      // Initial values
      const initialBalance = await soneiumVoteToken.balanceOf(addr1.address);
      const initialSupply = await soneiumVoteToken.totalSupply();
      
      // Burn 50 tokens
      await soneiumVoteToken.connect(addr1).burn("50000000000000000000");
      
      // Final values
      const finalBalance = await soneiumVoteToken.balanceOf(addr1.address);
      const finalSupply = await soneiumVoteToken.totalSupply();
      
      // Assertions
      expect(finalBalance.toString()).to.equal("50000000000000000000");
      expect(finalSupply.toString()).to.equal(
        (BigInt(initialSupply.toString()) - BigInt("50000000000000000000")).toString()
      );
    });

    it("Should not allow users to burn more tokens than they have", async function () {
      // Transfer 100 tokens to addr1
      await soneiumVoteToken.transfer(addr1.address, "100000000000000000000");
      
      // Try to burn 200 tokens
      await expect(
        soneiumVoteToken.connect(addr1).burn("200000000000000000000")
      ).to.be.revertedWithCustomError(soneiumVoteToken, "ERC20InsufficientBalance");
    });
  });

  describe("Staking Functionality", function () {
    beforeEach(async function () {
      // Transfer tokens to addr1 for testing
      await soneiumVoteToken.transfer(addr1.address, "1000000000000000000000");
      
      // Approve the rewarder contract to spend addr1's tokens
      await soneiumVoteToken.connect(addr1).approve(
        await voteTokenRewarder.getAddress(), 
        "1000000000000000000000"
      );
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = "100000000000000000000"; // 100 tokens
      
      // Stake tokens
      await voteTokenRewarder.connect(addr1).stake(stakeAmount);
      
      // Check balances
      expect((await voteTokenRewarder.balanceOf(addr1.address)).toString()).to.equal(stakeAmount);
      expect((await voteTokenRewarder.totalSupply()).toString()).to.equal(stakeAmount);
      
      // Check tokens were transferred to the contract
      const contractBalance = await soneiumVoteToken.balanceOf(await voteTokenRewarder.getAddress());
      expect(contractBalance.toString()).to.equal(stakeAmount);
    });

    it("Should not allow staking zero amount", async function () {
      await expect(
        voteTokenRewarder.connect(addr1).stake("0")
      ).to.be.revertedWith("Cannot stake zero");
    });

    it("Should allow users to withdraw staked tokens", async function () {
      const stakeAmount = "100000000000000000000"; // 100 tokens
      
      // Stake tokens first
      await voteTokenRewarder.connect(addr1).stake(stakeAmount);
      
      // Withdraw half the tokens
      await voteTokenRewarder.connect(addr1).withdraw("50000000000000000000");
      
      // Check balances
      expect((await voteTokenRewarder.balanceOf(addr1.address)).toString()).to.equal("50000000000000000000");
      expect((await voteTokenRewarder.totalSupply()).toString()).to.equal("50000000000000000000");
      
      // Check addr1 received the tokens back
      const addr1Balance = await soneiumVoteToken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("950000000000000000000"); // 1000 - 100 + 50 = 950
    });

    it("Should allow users to claim rewards", async function () {
      const stakeAmount = "100000000000000000000"; // 100 tokens
      
      // First give the rewarder permission to mint
      // Since only the owner can mint, transfer some tokens to rewarder for this test
      await soneiumVoteToken.transfer(
        await voteTokenRewarder.getAddress(), 
        "1000000000000000000000"
      );
      
      // Stake tokens
      await voteTokenRewarder.connect(addr1).stake(stakeAmount);
      
      // Fast forward time (simulate waiting period)
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine");
      
      // Claim rewards
      await voteTokenRewarder.connect(addr1).claimReward();
      
      // Check addr1's balance (should include rewards)
      // Expected reward = 3600 seconds * 0.1 tokens per second = 360 tokens
      const addr1Balance = await soneiumVoteToken.balanceOf(addr1.address);
      
      // Since exact timing can vary in tests, we just check that balance is greater than starting balance
      expect(BigInt(addr1Balance.toString())).to.be.gt(BigInt("900000000000000000000")); // Original 1000 - 100 staked
    });
    
    it("Should allow users to exit (withdraw and claim)", async function () {
      const stakeAmount = "100000000000000000000"; // 100 tokens
      
      // First give the rewarder permission to mint
      await soneiumVoteToken.transfer(
        await voteTokenRewarder.getAddress(), 
        "1000000000000000000000"
      );
      
      // Stake tokens
      await voteTokenRewarder.connect(addr1).stake(stakeAmount);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine");
      
      // Exit (withdraw all and claim rewards)
      await voteTokenRewarder.connect(addr1).exit();
      
      // Check staking balance is zero
      expect((await voteTokenRewarder.balanceOf(addr1.address)).toString()).to.equal("0");
      
      // Check user has original tokens plus rewards
      const addr1Balance = await soneiumVoteToken.balanceOf(addr1.address);
      expect(BigInt(addr1Balance.toString())).to.be.gt(BigInt("1000000000000000000000"));
    });
  });

  describe("Reward Settings", function () {
    it("Should allow owner to update reward rate", async function () {
      const newRate = "200000000000000000"; // 0.2 tokens per second
      
      await voteTokenRewarder.setRewardRate(newRate);
      
      expect((await voteTokenRewarder.rewardRate()).toString()).to.equal(newRate);
    });
    
    it("Should not allow non-owners to update reward rate", async function () {
      await expect(
        voteTokenRewarder.connect(addr1).setRewardRate("200000000000000000")
      ).to.be.revertedWithCustomError(voteTokenRewarder, "OwnableUnauthorizedAccount");
    });
  });
});