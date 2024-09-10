import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x5Fe27BF718937CA1c4a7818D246Cd4e755C7470c";
const merkleRoot =
  "0x8ae794071a632a1d002ed9368bde93a19f127cf1c4c1d06afa7d45411fca609d";

const MerkleDistributorModule = buildModule("MerkleDModule", (m) => {
  const token = m.getParameter("token", tokenAddress);
  const merkle = m.getParameter("merkleRoot", merkleRoot);
  const merkleDistributor = m.contract("MerkleDistributor", [token, merkle]);

  return { merkleDistributor };
});

export default MerkleDistributorModule;
