import { before, beforeEach, describe, it } from "node:test";
import { assert, expect } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';

const { viem, networkHelpers } = await hre.network.connect();
describe("DataOracle Min Max", function () {
  let DataOracle;
  let dataOracle;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await viem.getWalletClients();
    // Deploy contract
    const contract = await viem.deployContract('DataOracle', []);
    dataOracle = contract;
    await dataOracle.write.initialize([
       1, [user1.account.address, user2.account.address]
    ], {
       'account': owner.account.address
    });
  });

  it("should revert when setting value below min limit", async function () {
    const data = 10n**18n;
    await dataOracle.write.setData([data], {
       'account': user1.account.address
    });

    try {
       const data1 = 10n**17n;
       await dataOracle.write.setData([data1], {
       'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
  });

  it("should revert when setting value above max limit", async function () {
    const data = 10n**18n;
    await dataOracle.write.setData([data], {
       'account': user1.account.address
    });

    try {
       const data1 = 10n**19;
       await dataOracle.write.setData([data1], {
       'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
  });

  it("should set percent down", async function () {
    const data = 10n**18n;
    const data1 = 10n**17n;
    const data2 = 10n**16n;
    await dataOracle.write.setData([data], {
       'account': user1.account.address
    });

    try {
       await dataOracle.write.setData([data1], {
       'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
    try {
       await dataOracle.write.setMaxDownPercent([110n], {
       'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
    await dataOracle.write.setMaxDownPercent([95n], {
       'account': owner.account.address
       });
    await dataOracle.write.setData([data1], {
       'account': user1.account.address
       });
    try {
       await dataOracle.write.setData([data2], {
          'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
  });

  it("should set percent up", async function () {
    const data = 10n**18n;
    await dataOracle.write.setData([data], {
       'account': user1.account.address
    });

    try {
       await dataOracle.write.setData([data * 19n / 10n], {
       'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
    await dataOracle.write.setMaxUpPercent([95n], {
       'account': owner.account.address
       });
    await dataOracle.write.setData([data * 19n / 10n], {
       'account': user1.account.address
       });
    try {
       await dataOracle.write.setData([data * 2n], {
          'account': user1.account.address
       });
       assert.fail('should have been reverted');
    } catch(error) {
    }
  });


  it("should accept values within bounds", async function () {
    const data1 = 10n**18n;
    const data2 = 10n**18n + 10n**17n;
      
   // Test minimum boundary
   await dataOracle.write.setData([data1], {
       'account': user1.account.address
       }
   );
   await dataOracle.write.setData([data2], {
       'account': user1.account.address
       }
   );
});

  it("should handle boundary conditions for maxDownPercent", async function () {
    // Set initial data
    const initialData = 10n**18n;
    await dataOracle.write.setData([initialData], {
        account: user1.account.address
    });
    
    // Set maxDownPercent to 100% (maximum allowed)
    await dataOracle.write.setMaxDownPercent([100n], {
        account: owner.account.address
    });
    
    // Set data at exactly 1 (almost 100% decrease)
    let newData = 1n;
    await dataOracle.write.setData([newData], {
        account: user1.account.address
    });
    let data = await dataOracle.read.getLastData();
    expect(data).to.equal(newData);

    // set the data at a new value
    // This tests things to make sure that the percent
    // check is disabled for very low values
    newData = 10n**18n;
    await dataOracle.write.setData([newData], {
        account: user1.account.address
    });
    data = await dataOracle.read.getLastData();
    expect(data).to.equal(newData);
  });

  it("should set bounds cutoff correctly", async function () {
    const cutoffValue = 1000n;
    await dataOracle.write.setBoundsCutoff([cutoffValue], {
      account: owner.account.address
    });

    const currentCutoff = await dataOracle.read.boundsCutoff();
    assert.equal(currentCutoff, cutoffValue);
  });

  it("should revert when setting bounds cutoff with non-admin account", async function () {
    const cutoffValue = 1000n;

    try {
      await dataOracle.write.setBoundsCutoff([cutoffValue], {
         account: user1.account.address
      });
      assert.fail("Expected transaction to be reverted");
    } catch (error) {
      // Expect revert due to lack of permissions
    }
  });

  it("should reset votes when bounds cutoff is updated", async function () {
    // Enable voting
    await dataOracle.write.setThreshold([2], {
       account: owner.account.address
    });

    // Vote for a value first
    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });

    // Confirm vote was registered
    const voteCountBefore = await dataOracle.read.voteCount();
    assert.equal(voteCountBefore, 1n);

    // Update bounds cutoff
    await dataOracle.write.setBoundsCutoff([500n], {
      account: owner.account.address
    });

    // Vote count should reset
    const voteCountAfter = await dataOracle.read.voteCount();
    assert.equal(voteCountAfter, 0n);
  });

  it("should disable bounds checking when current value is below bounds cutoff", async function () {
    const currentValue = 10n ** 18n; // 1 ETH
    const boundsCutoff = 10n ** 17n; // 0.1 ETH
    const maxValue = currentValue * 15n / 10n; // 1.5 ETH (150% of current value)

    // Set initial data value
    await dataOracle.write.setData([currentValue], {
      account: user1.account.address
    });

     // Attempt to set data exceeding bounds - should revert
    try {
        await dataOracle.write.setData([maxValue], {
            account: user1.account.address
        });
        assert.fail('should have been reverted');
    } catch (error) {
        // Expected to fail
    }
 
    // Set bounds cutoff
    await dataOracle.write.setBoundsCutoff([boundsCutoff], {
      account: owner.account.address
    });

    // Attempt to set a value that would be out of bounds if cutoff was not applied
    // Since currentValue (1 ETH) is greater than boundsCutoff (0.1 ETH), bounds checking should apply
    // But if we set boundsCutoff lower than currentValue, bounds checking is disabled
    await dataOracle.write.setBoundsCutoff([currentValue - 1n], { // Set cutoff just below current value
      account: owner.account.address
    });

    // Now try setting a value that would normally be rejected due to bounds
    await dataOracle.write.setData([maxValue], {
      account: user1.account.address
    });

    // Verify the new value was set successfully
    const data = await dataOracle.read.getLastData();
    expect(data).to.equal(maxValue);
  });
});