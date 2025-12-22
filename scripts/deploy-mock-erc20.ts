import hre from "hardhat";
const { viem, networkHelpers } = await hre.network.connect();

async function main() {
  const token = await viem.deployContract(
     "MockERC20"
  );
  console.log("Deployed contract address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
