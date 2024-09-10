"use strict";
// Most of the code in this file is vendored from Uniswap's Merkle distributor:
// https://github.com/Uniswap/merkle-distributor/blob/c3255bfa2b684594ecd562cacd7664b0f18330bf/src/balance-tree.ts
// The main changes from the original file are:
// - Replace explicit `account` and `amount` variables with a custom  `claim`
//   object. This includes changing the function that computes the hash of a
//   claim.
// - Formatting and imports.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const claim_1 = require("../claim");
const merkle_tree_1 = __importDefault(require("./merkle-tree"));
class BalanceTree {
    constructor(balances) {
        this.tree = new merkle_tree_1.default(balances.map((claim, index) => {
            return BalanceTree.toNode(index, claim);
        }));
    }
    static verifyProof(index, claim, proof, root) {
        let pair = BalanceTree.toNode(index, claim);
        for (const item of proof) {
            pair = merkle_tree_1.default.combinedHash(pair, item);
        }
        return pair.equals(root);
    }
    // keccak256(abi.encode(index, ...claim))
    static toNode(index, claim) {
        return (0, claim_1.claimHash)(index, claim);
    }
    getHexRoot() {
        return this.tree.getHexRoot();
    }
    // returns the hex bytes32 values of the proof
    getProof(index, claim) {
        return this.tree.getHexProof(BalanceTree.toNode(index, claim));
    }
}
exports.default = BalanceTree;
