"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ts_1 = require("./src/ts");
const outputFolder = "./mock-airdorp-data";
async function removeSplitClaimFiles(path) {
    await fs_1.promises.rm(`${path}/mapping.json`, { recursive: true, force: true });
    await fs_1.promises.rm(`${path}/chunks`, { recursive: true, force: true });
}
async function processAllocationsCSV() {
    console.log("Processing input files...");
    const claims = await (0, ts_1.parseCsvFile)("./mock-airdrop-data/allocations.csv");
    console.log("Generating Merkle proofs...");
    const { merkleRoot, claims: claimsWithProof } = (0, ts_1.computeProofs)(claims);
    console.log("Clearing old files...");
    await fs_1.promises.rm(`${outputFolder}/addresses.json`, {
        recursive: true,
        force: true,
    });
    await fs_1.promises.rm(`${outputFolder}/steps.json`, { recursive: true, force: true });
    await fs_1.promises.rm(`${outputFolder}/txhashes.json`, {
        recursive: true,
        force: true,
    });
    await fs_1.promises.rm(`${outputFolder}/claims.json`, { recursive: true, force: true });
    await removeSplitClaimFiles(outputFolder);
    console.log("Saving generated data to file...");
    await fs_1.promises.mkdir(outputFolder, { recursive: true });
    await fs_1.promises.writeFile(`${outputFolder}/claims.json`, JSON.stringify(claimsWithProof));
    await fs_1.promises.writeFile(`${outputFolder}/merkleRoot.json`, JSON.stringify(merkleRoot));
    await (0, ts_1.splitClaimsAndSaveToFolder)(claimsWithProof, outputFolder);
}
processAllocationsCSV();
