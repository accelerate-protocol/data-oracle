import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const proxyModule = buildModule("DataOracleUpgradeableModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const dataOracle = m.contract("DataOracle");
  m.call(dataOracle, "initialize", [3, [m.getAccount(0)]]);
  const proxy = m.contract("TransparentUpgradeableProxy", [
    dataOracle,
    proxyAdminOwner,
    "0x",
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
