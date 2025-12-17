// test/DataOracle.test.js
import { before, describe, it } from "node:test";
import { assert } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';

const { viem, networkHelpers } = await hre.network.connect();
describe('DataOracle', () => {
  let dataOracle;
  let owner;
  let user;
  let walletClient;
  let publicClient;

  before(async () => {
    // Get accounts
    [owner, user] = await viem.getWalletClients();
    
    // Deploy contract
    const contract = await viem.deployContract('DataOracle', []);
    dataOracle = contract;
    
    // Get clients
    walletClient = await viem.getWalletClient();
    publicClient = await viem.getPublicClient();
  });

  it('should set data correctly', async () => {
    const testData = '0x68656c6c6f'; // "hello" in hex
    const tx = await dataOracle.write.setData([testData], {
      account: owner.account.address
    });
    
    await publicClient.waitForTransactionReceipt({ hash: tx });
    
    // Verify data was set
    const [data, timestamp] = await dataOracle.read.getLastUpdate();
    assert.equal(data, testData);
  });

  it('should allow only owner to set data', async () => {
    const testData = '0x776f726c64'; // "world" in hex
    
    // Try to set data with non-owner account
    try {
      await dataOracle.write.setData([testData], {
        account: user.account.address
      });
      assert.fail('Should have reverted');
    } catch (error) {
      // Expected to fail
    }
  });

  it('should return correct timestamp', async () => {
    const testData = '0x666f6f'; // "foo" in hex
    const tx = await dataOracle.write.setData([testData], {
      account: owner.account.address
    });
    
    await publicClient.waitForTransactionReceipt({ hash: tx });
    
    const [data, timestamp] = await dataOracle.read.getLastUpdate();
    assert.equal(data, testData);
    assert.typeOf(timestamp, 'bigint')
  });
});
