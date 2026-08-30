import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const proxyModule = buildModule("DataOracleUpgradeableModule", (m) => {
  const dataOracle = m.contract("DataOracle");

  const encodedFunctionCall = m.encodeFunctionCall(dataOracle,
    "initialize", [
    2, []
  ]);

  const proxy = m.contract("ERC1967Proxy", [
    dataOracle,
    encodedFunctionCall,
  ]);

    return { proxy };
});

const dataOracleModule = buildModule("DataOracleModule", (m) => {
  const { proxy } = m.useModule(proxyModule);

  const demo = m.contractAt("DataOracle", proxy);

  return { demo, proxy };
});

export default dataOracleModule;
