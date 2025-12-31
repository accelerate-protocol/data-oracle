import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dataOracleModule from "./DataOracleUpgradeable.ts"

const upgradeModule = buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { proxyAdmin, proxy } = m.useModule(dataOracleModule);

  const demoV2 = m.contract("DataOracleV2");
  m.call(proxyAdmin, "upgradeAndCall", [proxy, demoV2, "0x"], {
    from: proxyAdminOwner,
  });

  return { proxyAdmin, proxy };
});

export default upgradeModule;
