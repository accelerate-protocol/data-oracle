
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
    await dataOracle.write.initialize([], {
       'account': owner.account.address
    });

    // Set threshold to 2 for testing
    await dataOracle.write.setThreshold([2], {
       account: owner.account.address
    });
    await dataOracle.write.grantRole([
      await dataOracle.read.DATA_UPDATER_ROLE(),
      user1.account.address],
	{
	  account: owner.account.address
        });
    await dataOracle.write.grantRole([
      await dataOracle.read.DATA_UPDATER_ROLE(),
      user2.account.address],
	{
	  account: owner.account.address
        });
  });

  it("should record votes correctly and update data when threshold is met", async function () {
    // User1 votes for data value 100
    await dataOracle.write.setData([100], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User2 votes for the same value
    await dataOracle.write.setData([100], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    const [timestamp, data] = await dataOracle.read.getLastUpdate();
    expect(data).to.equal(100n);
  });

  it("should not update data if threshold is not met", async function () {
    // User1 votes for data value 200
    await dataOracle.write.setData([200], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);
    // User2 votes for a different value (should not update data)
    await dataOracle.write.setData([300], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    // Data should not be updated since vote values differ
    const [timestamp, data] = await dataOracle.read.getLastUpdate();
    expect(data).to.equal(0n);
  });

  it("should reset votes after data update", async function () {
    // User1 votes for data value 400
    await dataOracle.write.setData([400], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User2 votes for the same value
    await dataOracle.write.setData([400], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    // Data should be updated
    const [timestamp, data] = await dataOracle.read.getLastUpdate();
    expect(data).to.equal(400n);

    // Vote count should be reset
    expect(await dataOracle.read.voteCount()).to.equal(0n);
  });

  it("double votes reset the count", async function () {
    // User1 votes
    // User1 votes for data value 100
    await dataOracle.write.setData([100], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    await dataOracle.write.setData([100], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    // Data should not be updated since vote values differ
    const [timestamp, data] = await dataOracle.read.getLastUpdate();
    expect(data).to.equal(0n);
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
});

