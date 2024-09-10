"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allClaimTypes = exports.ClaimType = void 0;
exports.claimHash = claimHash;
exports.getClaimInput = getClaimInput;
exports.getClaimManyInput = getClaimManyInput;
exports.computeProofs = computeProofs;
const ethers_1 = require("ethers");
const balance_tree_1 = __importDefault(require("./claim/balance-tree"));
var ClaimType;
(function (ClaimType) {
    ClaimType[ClaimType["Airdrop"] = 0] = "Airdrop";
    ClaimType[ClaimType["GnoOption"] = 1] = "GnoOption";
    ClaimType[ClaimType["UserOption"] = 2] = "UserOption";
    ClaimType[ClaimType["Investor"] = 3] = "Investor";
    ClaimType[ClaimType["Team"] = 4] = "Team";
    ClaimType[ClaimType["Advisor"] = 5] = "Advisor";
})(ClaimType || (exports.ClaimType = ClaimType = {}));
exports.allClaimTypes = Object.keys(ClaimType)
    .map((c) => Number(c))
    .filter((c) => !isNaN(c));
// Returns a collision-free identifier for the pair (claim, index).
function claimHash(index, { account, type, claimableAmount }) {
    return Buffer.from(ethers_1.utils
        .solidityKeccak256(["uint256", "uint8", "address", "uint256"], [index, type, account, claimableAmount])
        .substr(2), "hex");
}
// The list of input values for the `claim` function in the order they are
// expected to be.
const claimInputEntries = [
    "index",
    "type",
    "account",
    "claimableAmount",
    "claimedAmount",
    "proof",
];
// Returns the exact input to give to the function `claim` in order to submit
// the claim.
function getClaimInput(claim) {
    return claimInputEntries.map((entry) => claim[entry]);
}
// Returns the exact input to give to the function `claimMany` in order to
// submit the claim.
function getClaimManyInput(claims) {
    return [
        ...claimInputEntries.map((entry) => claims.map((claim) => claim[entry])),
        claims.map(({ value }) => value ?? ethers_1.constants.Zero),
    ];
}
// Computes a Merkle root hash that identifies all and only input claims, along
// with all information needed by each user to perform the claim.
function computeProofs(claims) {
    // Sorting by address so that different claims for the same account are
    // close together in the `claimedBitMap`, so that performing multiple claims
    // in the same transaction touches less storage slots.
    // Keep track of the original index to sort back.
    const sortedClaims = claims
        .map((claim, indexBeforeSorting) => ({ ...claim, indexBeforeSorting }))
        .sort(({ account: lhs }, { account: rhs }) => lhs == rhs ? 0 : lhs.toLowerCase() < rhs.toLowerCase() ? -1 : 1);
    const tree = new balance_tree_1.default(sortedClaims);
    const provenClaims = sortedClaims
        .map((claim, index) => ({
        ...claim,
        index,
        proof: tree.getProof(index, claim),
    }))
        .sort(({ indexBeforeSorting: lhs }, { indexBeforeSorting: rhs }) => lhs - rhs);
    provenClaims.forEach((claim) => delete claim.indexBeforeSorting);
    return {
        claims: provenClaims,
        merkleRoot: tree.getHexRoot(),
    };
}
