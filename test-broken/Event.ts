// test/DataOracle.Historical.test.js
// Disable:  There seems to be an issue with viem.assertions not
// sending the write accounts when used with a local blockchain


import { before, describe, it } from "node:test";
import { assert, expect } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';
import { anyValue } from "@nomicfoundation/hardhat-viem-assertions/predicates";

const { viem, networkHelpers } = await hre.network.connect();


describe('DataOracle - Events', () => {
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
  });

  it("should emit DataUpdated event when setData is called", async function () {
    const testData = 12345;
    // Deploy contract
    const dataOracle = await viem.deployContract('DataOracle', [], {
      client: owner
    });
    await viem.assertions.emitWithArgs(
      dataOracle.write.setData([testData], {
        account: owner.account.address
      }),
      dataOracle,
      "DataUpdated",
      [anyValue, 12345n, 1n]
    );
  });

  it("should emit DataUpdated event with correct historical count", async function () {
    const contract = await viem.deployContract('DataOracle', []);
    // Set first data
    await contract.write.setData([100], {
        account: owner.account.address
      });
    
    // Set second data
    await contract.write.setData([200], {
        account: owner.account.address
      });
    
    // Set third data
    await contract.write.setData([300], {
        account: owner.account.address
      });

    await viem.assertions.emitWithArgs(
      await contract.write.setData([400],{
        account: owner.account.address
      }),
      contract,
      "DataUpdated",
      [anyValue, 400n, 4n]
    );
  });
});
