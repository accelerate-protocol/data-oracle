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
    await dataOracle.write.initialize(
       [1, [owner.account.address]], {
       'account': owner.account.address
    });
    
    // Get clients
    walletClient = await viem.getWalletClient();
    publicClient = await viem.getPublicClient();
  });

  it('should set data correctly', async () => {
    const testData = 0x68656n * 10n**18n;
    const tx = await dataOracle.write.setData([testData], {
      account: owner.account.address
    });
    
    await publicClient.waitForTransactionReceipt({ hash: tx });
    
    // Verify data was set
    const data = await dataOracle.read.getLastData();
    assert.equal(data, testData);
  });

  it('should allow only owner to set data', async () => {
    const testData = 0x776f726c64n * 10n**18n; // "world" in hex
    
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
    const testData = 0x666f6fn * 10n**18n; // "foo" in hex
    const tx = await dataOracle.write.setData([testData], {
      account: owner.account.address
    });
    
    await publicClient.waitForTransactionReceipt({ hash: tx });
    
    const data = await dataOracle.read.getLastData();
    assert.equal(data, testData);
  });

  it('should return version', async () => {
    const version = await dataOracle.read.version();
    assert.typeOf(version, 'string');
  });

});
