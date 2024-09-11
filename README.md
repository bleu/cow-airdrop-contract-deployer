# Airdrop Contract Deployer

Use this project to deploy your ERC20Permit airdrop contracts. It follows the patttern interpreted by the CoW Aidrop Hooks dapp. To learn more about CoW Hooks, [click here](https://cow.fi/learn/cow-hooks-you-are-in-control).

In order to deploy the contract and build the needed off-chain data of your airdrop, you will need to input a .csv file containing two columns: Address (the token receivers) and Airdrop (the amount of tokens of each one).

This contract uses the merkle proof system ([see more about here](https://medium.com/crypto-0-nite/merkle-proofs-explained-6dd429623dc5)) to check the claim legitimacy.

After following the steps below, you should have a folder containing the folder that the CoW frontend application will nedd to access to verify the users possible claims (see example [here](https://github.com/bleu/cow-airdrop-contract-deployer/tree/example/mock-airdrop-data)). If your wish is that your contract should appear in the CoW Airdrop Hooks application, you should make your folder available through a http request (possibly using github, for example).

## Dependencies

- yarn

## Usage

**1.** Install modules

```shell
yarn install
```

**2.** Move your input .csv file with airdrop allocations to /input-folder and fill the .env with its name

An example .csv file can be seen [here](https://github.com/bleu/cow-airdrop-contract-deployer/tree/example/input-folder)

The output should look like [this](https://github.com/bleu/cow-airdrop-contract-deployer/tree/example/mock-airdrop-data) plus a merkleRoot.json file

**3.** Process files. Convert the .csv into a folder containing the merkleProof, the chunks and the mapping.json file

```shell
yarn preprocess
```

**4.** Set up contract constructor variables in .env file:

- set MERKLE_ROOT to the merkleRoot generated in /mock-airdrop-data/merkleRoot.json
- set TOKEN_ADDRESS to the contract address in the network you want to deploy of the token to be used

**5.** Compile contract

```shell
npx hardhat compile
```

**6.** Deploy contract

- Declare your network RPC URL and private key in the .env file
- change /hardhat.config.ts to support the network you want to deploy

```shell
npx hardhat ignition deploy ignition/modules/MerkleDistributor.ts --deployment-id <id_of_your_choice>
```

The parameter `<id_of_your_choice>` is optional and you can use to make it easier to verify the contract later

**7.** Verify contract

Declare your Etherscan API key in the .env file

```shell
npx hardhat ignition verify <optional_id_of_your_choice>
```
