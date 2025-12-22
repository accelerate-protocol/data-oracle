import hre from "hardhat";
const { viem, networkHelpers } = await hre.network.connect();

async function main() {
  const token = await viem.deployContract(
     "DataOracle"
  );
  console.log("Deployed contract address:", token.address);
  await token.write.initialize();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
