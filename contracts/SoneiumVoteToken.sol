// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @title Soneium Vote Token (SNTV)
/// @notice ERC20 token for voting purposes on the Soneium chain
contract SoneiumVoteToken is ERC20, Ownable {
    uint8 private immutable _decimals;

    /// @param name_ Name of the token (e.g., "Soneium Vote Token")
    /// @param symbol_ Symbol of the token (e.g., "SNTV")
    /// @param decimals_ Decimal places (commonly 18)
    /// @param initialSupply Initial minted supply (in smallest units)
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    /// @notice Returns the number of decimals used
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Mint new tokens (only owner)
    /// @param to Recipient address
    /// @param amount Amount to mint (in smallest units)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from caller
    /// @param amount Amount to burn
    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }
}


/// @title Reward Mechanism for Soneium Vote Token
/// @notice Users stake their SoneiumVoteToken (SNTV) to earn additional SNTV rewards
contract VoteTokenRewarder is Ownable {
    SoneiumVoteToken public immutable voteToken;

    uint256 public rewardRate;          // tokens per second, scaled by 1e18
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;

    uint256 private _totalSupply;

    event RewardRateUpdated(uint256 newRate);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _voteToken, uint256 _initialRate) Ownable(msg.sender) {
        voteToken = SoneiumVoteToken(_voteToken);
        rewardRate = _initialRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = _rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = _earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /// @notice View total staked
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /// @notice View stake balance of a user
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    /// @notice Stake SNTV to earn rewards
    /// @param amount Amount to stake
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake zero");
        _totalSupply += amount;
        balances[msg.sender] += amount;
        voteToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked SNTV
    /// @param amount Amount to withdraw
    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw zero");
        _totalSupply -= amount;
        balances[msg.sender] -= amount;
        voteToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim accumulated rewards
    function claimReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            // Mint new tokens as rewards; contract needs MINTER_ROLE or owner
            voteToken.mint(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    /// @notice Exit staking: withdraw and claim
    function exit() external {
        withdraw(balances[msg.sender]);
        claimReward();
    }

    /// @notice Set a new reward rate
    /// @param newRate New reward rate (tokens per second, scaled by 1e18)
    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)) {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /// @dev Calculates reward per token
    function _rewardPerToken() internal view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) /
            _totalSupply;
    }

    /// @dev Calculates earned rewards for a user
    function _earned(address account) internal view returns (uint256) {
        return
            (balances[account] *
                (_rewardPerToken() - userRewardPerTokenPaid[account])) /
            1e18 + rewards[account];
    }
}
