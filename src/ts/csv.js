"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimLegend = void 0;
exports.parseCsv = parseCsv;
exports.parseCsvFile = parseCsvFile;
exports.writeCsv = writeCsv;
exports.writeCsvToFile = writeCsvToFile;
const fs_1 = require("fs");
const csv_1 = require("csv");
const ethers_1 = require("ethers");
const claim_1 = require("./claim");
// This is the header that is expected from the CSV for the corresponding claim
// type.
exports.claimLegend = {
    Airdrop: claim_1.ClaimType.Airdrop,
    GnoOption: claim_1.ClaimType.GnoOption,
    UserOption: claim_1.ClaimType.UserOption,
    Investor: claim_1.ClaimType.Investor,
    Team: claim_1.ClaimType.Team,
    Advisor: claim_1.ClaimType.Advisor,
};
// The header of the column containing the addresses of the claim owner.
const accountLegend = "Account";
async function parseCsv(stream) {
    const result = [];
    const parser = stream.pipe((0, csv_1.parse)({ columns: true }));
    for await (const line of parser) {
        if (!Object.keys(line).includes(accountLegend)) {
            throw new Error(`Each CSV line must specify an account. Found: ${JSON.stringify(line)}`);
        }
        const account = ethers_1.utils.getAddress(line[accountLegend]);
        for (const key of Object.keys(line)) {
            if (Object.keys(exports.claimLegend).includes(key)) {
                const type = exports.claimLegend[key];
                const claimableAmount = ethers_1.BigNumber.from(line[key] || "0");
                if (!claimableAmount.eq(0)) {
                    result.push({
                        account,
                        type,
                        claimableAmount,
                    });
                }
            }
        }
    }
    return result;
}
function parseCsvFile(csvPath) {
    return parseCsv((0, fs_1.createReadStream)(csvPath));
}
function writeCsv(claims) {
    const claimsByAccount = {};
    for (const claim of claims) {
        const user = ethers_1.utils.getAddress(claim.account);
        if (claimsByAccount[user] === undefined) {
            claimsByAccount[user] = [];
        }
        claimsByAccount[user].push(claim);
    }
    const headers = [
        "Account",
        "Airdrop",
        "GnoOption",
        "UserOption",
        "Investor",
        "Team",
        "Advisor",
    ];
    const stringifier = (0, csv_1.stringify)({
        header: true,
        columns: headers,
    });
    for (const [user, userClaims] of Object.entries(claimsByAccount)) {
        if (userClaims.length != new Set(userClaims.map(({ type }) => type)).size) {
            throw new Error(`Account ${user} has more than one claim for the same type. This case is currently not implemented.`);
        }
        const amountByClaimType = Object.keys(exports.claimLegend)
            .map((key) => [
            key,
            userClaims
                .filter(({ type }) => type === exports.claimLegend[key])[0]
                ?.claimableAmount.toString(),
        ])
            .filter(([, value]) => value !== undefined);
        stringifier.write(Object.fromEntries(amountByClaimType.concat([[accountLegend, user]])));
    }
    stringifier.end();
    return stringifier;
}
async function writeCsvToFile(csvPath, claims) {
    return new Promise((resolve) => writeCsv(claims).pipe((0, fs_1.createWriteStream)(csvPath)).on("end", resolve));
}
