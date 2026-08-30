import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dataOracleModule from "./DataOracleUpgradeable.ts"

const upgradeModule = buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { proxy } = m.useModule(dataOracleModule);

  const demoV2 = m.contract("DataOracleV2");
  const demo = m.contractAt("DataOracle", proxy);

  m.call(demo, "upgradeToAndCall", [demoV2, "0x"], {
    from: proxyAdminOwner,
  });

  return { proxy };
});

export default upgradeModule;
