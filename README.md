## Deployment
To deploy the contract:
Run:
```
 npx hardhat run ignition/modules/deploy.js --network minato
 ```

Output:
```
Starting deployment process for Soneium contracts...
Deploying contracts with account: 0xF78391F0992E80959fe3Fe55340270D26C56E3Ae
Deploying SoneiumVoteToken...
SoneiumVoteToken deployed to: 0x2Fad953E1F524e6590EdF50BDA6FCB391Dd4Fd96
Deploying VoteTokenRewarder...
VoteTokenRewarder deployed to: 0x359451AC3C73827A7653C0Ab7D30243844a55447

Deployment Summary:
-------------------
Token Name: Soneium Vote Token
Token Symbol: SNTV
Token Decimals: 18
Total Supply: 1000000000000000000000000 (raw units)
Token Owner: 0xF78391F0992E80959fe3Fe55340270D26C56E3Ae
Rewarder linked to token: 0x2Fad953E1F524e6590EdF50BDA6FCB391Dd4Fd96
Reward Rate: 100000000000000000 (raw units per second)
Rewarder Owner: 0xF78391F0992E80959fe3Fe55340270D26C56E3Ae

Performing initial setup...
Transferring 100000000000000000000000 tokens to rewarder contract...
Checking rewarder token balance...
Rewarder contract has 100000000000000000000000 tokens

Deployment and setup completed successfully!
SoneiumVoteToken: 0x2Fad953E1F524e6590EdF50BDA6FCB391Dd4Fd96
VoteTokenRewarder: 0x359451AC3C73827A7653C0Ab7D30243844a55447
```

## To verify the contract
**For SoneiumVoteToken:**
Run:
```
npx hardhat verify --network minato 0x2Fad953E1F524e6590EdF50BDA6FCB391Dd4Fd96 "Soneium Vote Token" "SNTV" 18 1000000000000000000000000
```
Output
```
Successfully verified contract SoneiumVoteToken on the block explorer.
https://soneium-minato.blockscout.com/address/0x2Fad953E1F524e6590EdF50BDA6FCB391Dd4Fd96#code
```
**For VoteTokenRewarder**
Run:
```
npx hardhat verify --network minato 0x359451AC3C73827A7653C0Ab7D30243844a55447 0x2Fad953E1F524e6590EdF50BDA6FCB391Dd4Fd96 100000000000000000 
```

Output:
```
https://soneium-minato.blockscout.com/address/0x359451AC3C73827A7653C0Ab7D30243844a55447#code
```