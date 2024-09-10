# Airdrop Contract Deployer

Use this project to deploy your airdrop contracts.

1. Install modules

```shell
yarn install
```

2. Move your "allocations.csv" file to /input-folder

3. Process files

```shell
yarn preprocess
```

4. Set up contract constructor variables

In /ignition/modules/MerkleDistributor.ts:

- set merkleRoot to the merkeRoot generated in /mock-aridrop-data/merkleRoot.json
- set tokenAddress to the contract address of token to be used

5. Compile contract

```shell
yarn compile
```

6. Deploy contract

- check needed .env keys in /hardhat.config.ts and declare them

```shell
npx hardhat ignition deploy ignition/modules/MerkleDistributor.ts --network <network> --deployment-id <optional_id_of_your_choice>
```

7. Verify contract

```shell
npx hardhat ignition verify <optional_id_of_your_choice>
```
