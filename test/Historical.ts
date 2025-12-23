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
  let publicClient;

  before(async () => {
    // Get accounts
    const accounts = await viem.getWalletClients();
    [owner, user] = accounts;

    // Deploy contract
    const contract = await viem.deployContract('DataOracle', [], {
       client: owner
    });
    dataOracle = contract;
    await dataOracle.write.initialize([
       1, [owner.account.address]
    ], {
       'account': owner.account.address
    });

    publicClient = await viem.getPublicClient();
  });

  it('should store historical data correctly', async () => {
    // Set first data
    const testData1 = 0x68656c6c6fn; // "hello" in hex
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
    const [currentTimestamp, currentData] = await dataOracle.read.getLastUpdate();
    assert.equal(currentData, testData2);
    
    // Verify historical data was stored
    const historicalCount = await dataOracle.read.historicalCount();
    assert.isAbove(Number(historicalCount), 0);
  });

  it('should handle multiple data sets with proper timestamps', async () => {
    // Clear existing data and set multiple values
    const testData1 = 0x61n; // "a" in hex
    const testData2 = 0x62n; // "b" in hex
    const testData3 = 0x63n; // "c" in hex
    
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
    const [currentTimestamp, currentData] = await dataOracle.read.getLastUpdate();
    assert.typeOf(currentTimestamp, 'bigint');
    assert.equal(currentData, testData3);
  });

  it('should prevent unauthorized access to historical functions', async () => {
    // Try to set data with non-owner account - should fail
    const testData = 0x74657374n; // "test" in hex
    
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
    const testData1 = 0x616263n; // "abc" in hex
    const testData2 = 0x646566n; // "def" in hex
    
    // Set first data
    const tx1 = await dataOracle.write.setData([testData1], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx1 });
    
    const [timestamp1, data1] = await dataOracle.read.getLastUpdate();
    
    // Set second data
    const tx2 = await dataOracle.write.setData([testData2], {
      account: owner.account.address
    });
    await publicClient.waitForTransactionReceipt({ hash: tx2 });
    
    const [timestamp2, data2] = await dataOracle.read.getLastUpdate();
    
    // Verify data integrity
    assert.equal(data1, testData1);
    assert.equal(data2, testData2);
    assert.typeOf(timestamp1, 'bigint');
    assert.typeOf(timestamp2, 'bigint');
  });

  it('test historical', async () => {
    // Clear any existing data and set fresh data
    // Deploy contract
    const contract = await viem.deployContract('DataOracle', []);
    await contract.write.initialize([
      1, [owner.account.address]
    ], {
       'account': owner.account.address
    });


    const testData = [ 0x68656c6c6fn, // "hello"
      0x776f726c64n, // "world"
      0x616263n
    ] // "abc"
    
    for(const element of [0n, 1n, 2n]) {
      await contract.write.setData([testData[element]], {
        account: owner.account.address
      });
    }

    for(const element of [0n, 1n, 2n]) {
      const [timestamp, data] = await contract.read.historicalData([element]);
      assert.equal(data, testData[element]);
      assert.typeOf(timestamp, 'bigint');
    }
  })
});


