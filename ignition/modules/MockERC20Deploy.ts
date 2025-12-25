import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockERC20Deploy", (m) => {
  const mockerc20 = m.contract("MockERC20", []);
  return { mockerc20 };
});
