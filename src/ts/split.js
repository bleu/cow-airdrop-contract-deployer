"use strict";
// The functions in this file are responsible for splitting the list of claims
// into multiple smaller files that are cheaper to load by the frontend.
//
// The code is similar to the code used for the same purpose by Uniswap:
// https://github.com/Uniswap/mrkl-drop-data-chunks/blob/c215bf1e4360205acdc6c154389b10a2f287974d/split.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitClaims = splitClaims;
exports.splitClaimsAndSaveToFolder = splitClaimsAndSaveToFolder;
exports.removeSplitClaimFiles = removeSplitClaimFiles;
const fs_1 = require("fs");
const ethers_1 = require("ethers");
const claim_1 = require("./claim");
function* claimsBySortedAddress(claims) {
    if (claims.length === 0) {
        return;
    }
    const sortedClaims = [...claims].sort(({ account: lhs }, { account: rhs }) => lhs === rhs ? 0 : lhs.toLowerCase() < rhs.toLowerCase() ? -1 : 1);
    let currentUser = ethers_1.utils.getAddress(sortedClaims[0].account);
    let currentClaims = [];
    for (const claim of sortedClaims) {
        if (currentUser.toLowerCase() !== claim.account.toLowerCase()) {
            yield [currentUser, currentClaims];
            currentUser = claim.account;
            currentClaims = [];
        }
        currentClaims.push({
            proof: claim.proof,
            index: claim.index,
            type: claim_1.ClaimType[claim.type],
            amount: claim.claimableAmount.toString(),
        });
    }
    yield [currentUser, currentClaims];
}
function* chunkify(generator, chunkSize) {
    let currentChunk = [];
    for (const output of generator) {
        if (currentChunk.length < chunkSize) {
            currentChunk.push(output);
        }
        else {
            yield currentChunk;
            currentChunk = [output];
        }
    }
    yield currentChunk;
}
/**
 * Splits the input claims into cohorts of approximatively the same byte size.
 * Each cohort is identified by the first (lexicographically sorted) address
 * in the cohort. A separate entry links the first address to the last address
 * of the cohort.
 *
 * @param claims The claims to split in distinct chuncks.
 * @param maxCohortSize The appriximate maximum size of a cohort in number of
 * users.
 */
function* splitClaims(claims, desiredCohortSize = 70) {
    for (const chunk of chunkify(claimsBySortedAddress(claims), desiredCohortSize)) {
        const firstAddress = chunk[0][0].toLowerCase();
        const lastAddress = chunk[chunk.length - 1][0].toLowerCase();
        const mappingEntry = [firstAddress, lastAddress];
        const claimChunk = chunk.reduce((collected, [user, claims]) => {
            collected[user.toLowerCase()] = claims;
            return collected;
        }, {});
        yield [mappingEntry, claimChunk];
    }
}
async function splitClaimsAndSaveToFolder(claims, path) {
    const addressChunks = {};
    const chunksDir = `${path}/chunks`;
    await fs_1.promises.mkdir(chunksDir);
    for (const [[firstAddress, lastAddress], chunk] of splitClaims(claims)) {
        addressChunks[firstAddress] = lastAddress;
        await fs_1.promises.writeFile(`${chunksDir}/${firstAddress.toLowerCase()}.json`, JSON.stringify(chunk));
    }
    await fs_1.promises.writeFile(`${path}/mapping.json`, JSON.stringify(addressChunks));
}
async function removeSplitClaimFiles(path) {
    await fs_1.promises.rm(`${path}/mapping.json`, { recursive: true, force: true });
    await fs_1.promises.rm(`${path}/chunks`, { recursive: true, force: true });
}
