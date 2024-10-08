import { createReadStream, createWriteStream } from "fs";
import type { Readable, Writable } from "stream";

import { parse, stringify } from "csv";
import { BigNumber, utils } from "ethers";

import { ClaimType, Claim } from "./claim";

// This is the header that is expected from the CSV for the corresponding claim
// type.
export const claimLegend = {
  Airdrop: ClaimType.Airdrop,
  GnoOption: ClaimType.GnoOption,
  UserOption: ClaimType.UserOption,
  Investor: ClaimType.Investor,
  Team: ClaimType.Team,
  Advisor: ClaimType.Advisor,
} as const;
// The header of the column containing the addresses of the claim owner.
const accountLegend = "Account" as const;

export async function parseCsv(stream: Readable): Promise<Claim[]> {
  const result: Claim[] = [];

  const parser = stream.pipe(parse({ columns: true }));
  for await (const line of parser) {
    if (!Object.keys(line).includes(accountLegend)) {
      throw new Error(
        `Each CSV line must specify an account. Found: ${JSON.stringify(line)}`
      );
    }
    const account = utils.getAddress(line[accountLegend]);
    for (const key of Object.keys(line)) {
      if (Object.keys(claimLegend).includes(key)) {
        const type = claimLegend[key as keyof typeof claimLegend];
        const claimableAmount = BigNumber.from(line[key] || "0");
        if (!claimableAmount.eq(0)) {
          result.push({
            account,
            claimableAmount,
          });
        }
      }
    }
  }

  return result;
}

export function parseCsvFile(csvPath: string): Promise<Claim[]> {
  return parseCsv(createReadStream(csvPath));
}

export function writeCsv(claims: Claim[]): Writable {
  const claimsByAccount: Record<string, Claim[]> = {};
  for (const claim of claims) {
    const user = utils.getAddress(claim.account);
    if (claimsByAccount[user] === undefined) {
      claimsByAccount[user] = [];
    }
    claimsByAccount[user].push(claim);
  }

  const headers: (typeof accountLegend | keyof typeof claimLegend)[] = [
    "Account",
    "Airdrop",
    "GnoOption",
    "UserOption",
    "Investor",
    "Team",
    "Advisor",
  ];
  const stringifier = stringify({
    header: true,
    columns: headers,
  });
  for (const [user, userClaims] of Object.entries(claimsByAccount)) {
    const amountByClaimType = Object.keys(claimLegend)
      .map((key) => [key, userClaims[0]?.claimableAmount.toString()])
      .filter(([, value]) => value !== undefined);

    stringifier.write(
      Object.fromEntries(amountByClaimType.concat([[accountLegend, user]]))
    );
  }

  stringifier.end();

  return stringifier;
}

export async function writeCsvToFile(
  csvPath: string,
  claims: Claim[]
): Promise<void> {
  return new Promise((resolve) =>
    writeCsv(claims).pipe(createWriteStream(csvPath)).on("end", resolve)
  );
}
