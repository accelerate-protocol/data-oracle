import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DataOracleUpgradeableModule", (m) => {
  const dataOracle = m.contract("DataOracle");

  const encodedFunctionCall = m.encodeFunctionCall(dataOracle,
    "initialize", [
    2, []
  ]);

  const proxy = m.contract("ERC1967Proxy", [
    dataOracle,
    encodedFunctionCall,
  ]);

    return { proxy, dataOracle };
});
