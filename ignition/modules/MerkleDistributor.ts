import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";

dotenv.config();

const tokenAddress = process.env.TOKEN_ADDRESS;
const merkleRoot = process.env.MERKLE_ROOT;

const MerkleDistributorModule = buildModule("MerkleDModule", (m) => {
  const token = m.getParameter("token", tokenAddress);
  const merkle = m.getParameter("merkleRoot", merkleRoot);
  const merkleDistributor = m.contract("MerkleDistributor", [token, merkle]);

  return { merkleDistributor };
});

export default MerkleDistributorModule;
