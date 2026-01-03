// test/DataOracle.VotingEdgeCases.test.js
import { beforeEach, describe, it } from "node:test";
import { assert, expect } from 'chai';
import hre from "hardhat";
import { parseEther } from 'viem';

const { viem } = await hre.network.connect();

describe("DataOracle Voting Edge Cases", function () {
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
       2, [user1.account.address, user2.account.address, user3.account.address]
    ], {
       'account': owner.account.address
    });
  });

  it("should prevent double voting with same value before threshold", async function () {
    // User1 votes for data value 100
    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User1 tries to vote again - should reset vote
    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
  });

  it("should reset vote count when different value is voted", async function () {
    // User1 votes for data value 100
    await dataOracle.write.setData([100n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User2 votes for different value - should reset vote count
    await dataOracle.write.setData([200n * 10n**18n], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
  });

  it("should handle threshold changes correctly", async function () {
    // User1 votes for data value 200
    await dataOracle.write.setData([200n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);
    
    // Data should not be updated since vote values differ
    let data = await dataOracle.read.getLastData();
    expect(data).to.equal(0n);
    
    // Change threshold to 1
    await dataOracle.write.setThreshold([1], {
       account: owner.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
    
    // User1 votes again - should update immediately
    await dataOracle.write.setData([200n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
    data = await dataOracle.read.getLastData();
    expect(data).to.equal(200n * 10n**18n);
  });

  it("should handle multiple users voting correctly", async function () {
    // User1 votes for data value 300
    await dataOracle.write.setData([300n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // User2 votes for same value - should update data
    await dataOracle.write.setData([300n * 10n**18n], {
       account: user2.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);

    const data = await dataOracle.read.getLastData();
    expect(data).to.equal(300n * 10n**18n);
  });

  it("should reset vote count when threshold is reduced", async function () {
    // User1 votes for data value 400
    await dataOracle.write.setData([400n * 10n**18n], {
       account: user1.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(1n);

    // Reduce threshold to 1
    await dataOracle.write.setThreshold([1], {
       account: owner.account.address
    });
    expect(await dataOracle.read.voteCount()).to.equal(0n);
  });
});
