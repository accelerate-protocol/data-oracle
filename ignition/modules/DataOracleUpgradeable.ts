import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const proxyModule = buildModule("DataOracleUpgradeableModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);
  const dataOracle = m.contract("DataOracle");

  const encodedFunctionCall = m.encodeFunctionCall(dataOracle,
    "initialize", [
    2, []
  ]);

  const proxy = m.contract("TransparentUpgradeableProxy", [
    dataOracle,
    proxyAdminOwner,
    encodedFunctionCall,
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin",
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

    return { proxyAdmin, proxy };
});

export default proxyModule;
