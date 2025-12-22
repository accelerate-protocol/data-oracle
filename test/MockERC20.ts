
import { before, beforeEach, describe, it } from "node:test";
import { assert, expect } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';

const { viem, networkHelpers } = await hre.network.connect();
describe("Mock ERC20", function () {
  it("smoke test for mock erc20", async function () {
    const contract = await viem.deployContract('MockERC20', []);
   });
});

