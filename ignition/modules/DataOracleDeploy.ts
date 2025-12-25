import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DataDeploy", (m) => {
    const dataOracle = m.contract("DataOracle", []);
    const account0 = m.getAccount(0);

  m.call(dataOracle, "initialize", [3, [account0]]);

  return { dataOracle };
});
