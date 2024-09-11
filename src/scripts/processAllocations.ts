import { promises as fs } from "fs";
import dotenv from "dotenv";
import { parseCsvFile, computeProofs, splitClaimsAndSaveToFolder } from "../ts";

export interface CowDeploymentArgs {
  claims: string;
  settings: string;
}

dotenv.config();
const inputCsvFile = process.env.INPUT_CSV_FILE;
const inputPath = `./input-folder/${inputCsvFile}`;
const outputFolder = "./mock-airdrop-data";

async function removeSplitClaimFiles(path: string) {
  await fs.rm(`${path}/mapping.json`, { recursive: true, force: true });
  await fs.rm(`${path}/chunks`, { recursive: true, force: true });
}

async function processAllocationsCSV() {
  console.log("Processing input files...");
  const claims = await parseCsvFile(inputPath);

  console.log("Input file processed. Generating Merkle proofs...");
  const { merkleRoot, claims: claimsWithProof } = computeProofs(claims);

  console.log("Clearing old files...");
  await fs.rm(`${outputFolder}/addresses.json`, {
    recursive: true,
    force: true,
  });
  await fs.rm(`${outputFolder}/steps.json`, { recursive: true, force: true });
  await fs.rm(`${outputFolder}/txhashes.json`, {
    recursive: true,
    force: true,
  });
  await fs.rm(`${outputFolder}/claims.json`, { recursive: true, force: true });
  await removeSplitClaimFiles(outputFolder);

  console.log("Saving generated data to file...");
  await fs.mkdir(outputFolder, { recursive: true });

  await fs.writeFile(
    `${outputFolder}/claims.json`,
    JSON.stringify(claimsWithProof)
  );

  await fs.writeFile(
    `${outputFolder}/merkleRoot.json`,
    JSON.stringify(merkleRoot)
  );

  await splitClaimsAndSaveToFolder(claimsWithProof, outputFolder);
}

processAllocationsCSV();
