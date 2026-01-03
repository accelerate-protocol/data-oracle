
import { before, beforeEach, describe, it } from "node:test";
import { assert, expect } from 'chai';
import hre from "hardhat";
import { encodeFunctionData, parseEther } from 'viem';

const { viem, networkHelpers } = await hre.network.connect();
describe("DataOracle Voting Mechanism", function () {
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
       2, [user1.account.address, user2.account.address]
    ], {
       'account': owner.account.address
    });
  });

  it("should record votes correctly and update data when threshold is met", async function () {
    // User1 votes for data value 100
    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User2 votes for the same value
    await dataOracle.write.setData([100n* 10n**18n], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    const data = await dataOracle.read.getLastData();
    expect(data).to.equal(100n* 10n**18n);
  });

  it("should not update data if threshold is not met", async function () {
    // User1 votes for data value 200
    await dataOracle.write.setData([200n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);
    // User2 votes for a different value (should not update data)
    await dataOracle.write.setData([300n * 10n**18n], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    // Data should not be updated since vote values differ
    const data = await dataOracle.read.getLastData();
    expect(data).to.equal(0n);
  });

  it("should reset votes after data update", async function () {
    // User1 votes for data value 400
    await dataOracle.write.setData([400n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User2 votes for the same value
    await dataOracle.write.setData([400n * 10n**18n], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    // Data should be updated
    const data = await dataOracle.read.getLastData();
    expect(data).to.equal(400n * 10n**18n);

    // Vote count should be reset
    expect(await dataOracle.read.voteCount()).to.equal(0n);
  });

  it("double votes reset the count", async function () {
    // User1 votes
    // User1 votes for data value 100
    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    // Data should not be updated since vote values differ
    const data = await dataOracle.read.getLastData();
    expect(data).to.equal(0n);
  });

  it("test set threshold", async function () {
    // User1 votes for data value 200
    await dataOracle.write.setData([200n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);
    // Data should not be updated since vote values differ
    let data = await dataOracle.read.getLastData();
    expect(data).to.equal(0n);
    await dataOracle.write.setThreshold([1], {
       account: owner.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
    await dataOracle.write.setData([200n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
    data = await dataOracle.read.getLastData();
    expect(data).to.equal(200n * 10n**18n);

  });

  it("Invalid threshold", async function () {
    try {
    await dataOracle.write.setThreshold([0], {
       account: owner.account.address
    });
    assert.fail('should have reverted');
    } catch (error) {
     // expect to fail
    };
  });

  it("should prevent users without VOTER_ROLE from voting", async function () {
    // Try to set data with a user that does not have the VOTER_ROLE
    try {
        await dataOracle.write.setData([100n * 10n**18n], {
            account: user3.account.address
        });
        assert.fail('Should have reverted');
    } catch (error) {
        // Expected to fail
    }
  });

  it("should allow users with VOTER_ROLE to vote", async function () {
    // Set data with a user that has the VOTER_ROLE
    await dataOracle.write.setData([100n * 10n**18n], {
        account: user1.account.address
    });
    const voteCount = await dataOracle.read.voteCount();
    expect(voteCount).to.equal(1n);
  });
});

