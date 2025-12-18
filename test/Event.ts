// test/DataOracle.Historical.test.js
import { before, describe, it } from "node:test";
import { assert, expect } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';
import { anyValue } from "@nomicfoundation/hardhat-viem-assertions/predicates";

const { viem, networkHelpers } = await hre.network.connect();


describe('DataOracle - Events', () => {
  let dataOracle;
  let owner;
  let user;
  let walletClient;
  let publicClient;

  before(async () => {
    // Get accounts
    const accounts = await viem.getWalletClients();
    [owner, user] = accounts;
    
    // Get clients
    walletClient = await viem.getWalletClient();
    publicClient = await viem.getPublicClient();

    // Deploy contract
    const contract = await viem.deployContract('DataOracle', []);
    dataOracle = contract;
  });

  it("should emit DataUpdated event when setData is called", async function () {
    const testData = 12345;
    await viem.assertions.emitWithArgs(
      dataOracle.write.setData([testData]),
      dataOracle,
      "DataUpdated",
      [anyValue, 12345n, 1n]
    );
  });

  it("should emit DataUpdated event with correct historical count", async function () {
    const contract = await viem.deployContract('DataOracle', []);
    // Set first data
    await contract.write.setData([100]);
    
    // Set second data
    await contract.write.setData([200]);
    
    // Set third data
    await contract.write.setData([300]);

    await viem.assertions.emitWithArgs(
      await contract.write.setData([400]),
      contract,
      "DataUpdated",
      [anyValue, 400n, 4n]
    );
  });
});
