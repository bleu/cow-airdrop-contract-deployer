# Airdrop Contract Deployer

Use this project to deploy your ERC20Permit airdrop contracts. It follows the patttern interpreted by the CoW Aidrop Hooks dapp. To learn more about CoW Hooks, [click here](https://cow.fi/learn/cow-hooks-you-are-in-control).

In order to deploy the contract and build the needed off-chain data of your airdrop, you will need to input a .csv file containing two columns: Address (the token receivers) and Airdrop (the amount of tokens of each one).

This contract uses the merkle proof system ([see more about here](https://medium.com/crypto-0-nite/merkle-proofs-explained-6dd429623dc5)) to check the claim legitimacy.

After following the steps below, you should have a folder containing the folder that the CoW frontend application will nedd to access to verify the users possible claims (basically, the folder 'chunks' and the file 'mapping.json'). If your wish is that your contract should appear in the CoW Airdrop Hooks application, you should make your folder available through a http request (possibly using github, for example).

## Dependencies

- hardhat ^2.22.10
- yarn

## Usage

1. Install modules

```shell
yarn install
```

2. Move your "allocations.csv" file to /input-folder

The .csv must follow the pattern below:

Account,Airdrop
0x2ef2e49695f00fa835fb851c0575822f5f076a13,7915785761450277287136036
0x9d94ef33e7f8087117f85b3ff7b1d8f27e4053d5,4967440035500163493933763
0x445cc6c3d51eb0a63395a613a0960c7922bca0d6,2261774599509454379078923

Where "Account" is the receiver address and "Airdrop" the token amount to claim.

3. Process files. Convert the .csv into a folder containing the merkleProof, the chunks and the mapping.json file

```shell
yarn preprocess
```

4. Set up contract constructor variables in .env file:

- set MERKLE_ROOT to the merkleRoot generated in /mock-airdrop-data/merkleRoot.json
- set TOKEN_ADDRESS to the contract address in the network you want to deploy of the token to be used

5. Compile contract

```shell
npx hardhat compile
```

6. Deploy contract

- check needed .env keys in /hardhat.config.ts and declare them
- change /hardhat.config.ts to support the network you want to deploy

```shell
npx hardhat ignition deploy ignition/modules/MerkleDistributor.ts --network <network> --deployment-id <optional_id_of_your_choice>
```

7. Verify contract

```shell
npx hardhat ignition verify <optional_id_of_your_choice>
```
