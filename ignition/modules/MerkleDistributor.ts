import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x5Fe27BF718937CA1c4a7818D246Cd4e755C7470c";
const merkleRoot =
  "0xc1ebb0f7cb8ff2b044a59998ec3a98c3fffac39991a78de4aae44eeba9b72925";

const MerkleDistributorModule = buildModule("MerkleDModule", (m) => {
  const token = m.getParameter("token", tokenAddress);
  const merkle = m.getParameter("merkleRoot", merkleRoot);
  const merkleDistributor = m.contract("MerkleDistributor", [token, merkle]);

  return { merkleDistributor };
});

export default MerkleDistributorModule;
