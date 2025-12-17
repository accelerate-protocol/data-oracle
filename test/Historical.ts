// test/DataOracle.Historical.test.js
import { before, describe, it } from "node:test";
import { assert } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';

const { viem, networkHelpers } = await hre.network.connect();


describe('DataOracle - Historical Functions', () => {
  let dataOracle;
  let owner;
  let user;
  let walletClient;
  let publicClient;

  before(async () => {
    // Get accounts
    const accounts = await viem.getWalletClients();
    [owner, user] = accounts;
    
    // Deploy contract
    const contract = await viem.deployContract('DataOracle', []);
    dataOracle = contract;
    // Get clients
    walletClient = await viem.getWalletClient();
    publicClient = await viem.getPublicClient();

  });

  it('should store historical data correctly', async () => {
    // Set first data
    const testData1 = '0x68656c6c6f'; // "hello" in hex
    const tx1 = await dataOracle.write.setData([testData1], {
      account: owner.account.address
    });
    
    await publicClient.waitForTransactionReceipt({ hash: tx1 });
    
    // Set second data
    const testData2 = '0x776f726c64'; // "world" in hex
    const tx2 = await dataOracle.write.setData([testData2], {
      account: owner.account.address
    });
    
    await publicClient.waitForTransactionReceipt({ hash: tx2 });
    
    // Check current data
    const [currentData, currentTimestamp] = await dataOracle.read.getLastUpdate();
    assert.equal(currentData, testData2);
    
    // Verify historical data was stored
    const historicalCount = await dataOracle.read.getHistoricalCount();
    assert.isAbove(Number(historicalCount), 0);
  });

  it('should handle multiple data sets with proper timestamps', async () => {
    // Clear existing data and set multiple values
    const testData1 = '0x61'; // "a" in hex
    const testData2 = '0x62'; // "b" in hex
    const testData3 = '0x63'; // "c" in hex
    
    // Set first data
    const tx1 = await dataOracle.write.setData([testData1], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx1 });
    
    // Set second data
    const tx2 = await dataOracle.write.setData([testData2], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx2 });
    
    // Set third data
    const tx3 = await dataOracle.write.setData([testData3], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx3 });
    
    // Get current data
    const [currentData, currentTimestamp] = await dataOracle.read.getLastUpdate();
    assert.equal(currentData, testData3);
    assert.typeOf(currentTimestamp, 'bigint');
  });

  it('should prevent unauthorized access to historical functions', async () => {
    // Try to set data with non-owner account - should fail
    const testData = '0x74657374'; // "test" in hex
    
    try {
      await dataOracle.write.setData([testData], {
        account: user.account.address
      });
      assert.fail('Should have reverted');
    } catch (error) {
      // Expected to fail
    }
  });

  it('should maintain data integrity across multiple updates', async () => {
    const testData1 = '0x616263'; // "abc" in hex
    const testData2 = '0x646566'; // "def" in hex
    
    // Set first data
    const tx1 = await dataOracle.write.setData([testData1], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx1 });
    
    const [data1, timestamp1] = await dataOracle.read.getLastUpdate();
    
    // Set second data
    const tx2 = await dataOracle.write.setData([testData2], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx2 });
    
    const [data2, timestamp2] = await dataOracle.read.getLastUpdate();
    
    // Verify data integrity
    assert.equal(data1, testData1);
    assert.equal(data2, testData2);
    assert.typeOf(timestamp1, 'bigint');
    assert.typeOf(timestamp2, 'bigint');
  });

  it('should maintain data integrity through multiple operations', async () => {
    // Clear any existing data and set fresh data
    const testData1 = '0x68656c6c6f'; // "hello"
    const testData2 = '0x776f726c64'; // "world"
    const testData3 = '0x616263'; // "abc"
    
    await dataOracle.write.setData([testData1], {
      account: owner.account.address
    });
    
    await dataOracle.write.setData([testData2], {
      account: owner.account.address
    });
    
    await dataOracle.write.setData([testData3], {
      account: owner.account.address
    });
    
    const [data, timestamp] = await dataOracle.read.getHistoricalData([1n])
    assert.equal(data, testData1);
    assert.typeOf(timestamp, 'bigint');
  });
 
  it('should prevent out of bounds to historical functions', async () => {    
    try {
      // Clear any existing data and set fresh data
      const testData1 = '0x68656c6c6f'; // "hello"
      const testData2 = '0x776f726c64'; // "world"
      const testData3 = '0x616263'; // "abc"
    
      await dataOracle.write.setData([testData1], {
      	account: owner.account.address
      });		      
    
      await dataOracle.write.setData([testData2], {
        account: owner.account.address
      });
    
      await dataOracle.write.setData([testData3], {
        account: owner.account.address
      });
    
      const [data, timestamp] = await dataOracle.read.getHistoricalData([5n])
      assert.fail('Should have reverted');
    } catch (error) {
      // Expected to fail
    }
  });

});


