const ExchangeAdapter = artifacts.require('ExchangeAdapter');
const EtherToken = artifacts.require('EtherToken');
const PreminedAsset = artifacts.require('PreminedAsset');
const SimpleMarket = artifacts.require('SimpleMarket');
const chai = require('chai');

const assert = chai.assert;

contract('SimpleMarket', (accounts) => {
  let ethToken;
  let mlnToken;
  let simpleMarket;
  let adapter;

  before('Deploy contract instances', async () => {
    ethToken = await EtherToken.new();
    mlnToken = await PreminedAsset.new('Melon token', 'MLN', 18, 10 ** 28);
    simpleMarket = await SimpleMarket.new();
    adapter = await ExchangeAdapter.new(simpleMarket.address);
  });

  it('empty market has zero nexOrderId', async () => {
    const firstId = await adapter.getLastOrderId();
    assert.equal(firstId.toNumber(), 0);
  });

  describe('#makeOrder()', () => {
    it('calls without error', async () => {
      const amt = 1000;
      console.log(accounts[0]);
      console.log(simpleMarket.address);
      console.log(adapter.address);
      await mlnToken.approve(simpleMarket.address, amt, { from: accounts[0] });
      await adapter.makeOrder(
        mlnToken.address, ethToken.address, amt, amt, { from: accounts[0] },
      );
      throw 'asdkssad';
    });

    it('activates order', async () => {
      const oid = await adapter.getLastOrderId();
      const active = await adapter.isActive(oid);
      assert(active);
    });

    it('sets owner of order', async () => {
      const oid = await adapter.getLastOrderId();
      const owner = await adapter.getOwner(oid);
      assert.equal(adapter.address, owner);
    });
  });

  describe('#cancelOrder()', () => {
    it('calls without error', async () => {
      const oid = await adapter.getLastOrderId();
      await adapter.cancelOrder(oid);
    });

    it('deactivates order', async () => {
      const oid = await adapter.getLastOrderId();
      const active = await adapter.isActive(oid);
      assert.isFalse(active);
    });
  });

  describe('#takeOrder()', () => {
    const maker = accounts[1];
    const taker = accounts[2];
    before(async () => {
      await mlnToken.transfer(maker, 3000, { from: accounts[0] }); // give mlnT
      await ethToken.transfer(taker, 3000, { from: accounts[0] }); // give ethT
    });

    const tests = [
      { takeAmt: 500, makeAmt: 500, cond: '==', change: 500 },
      { takeAmt: 500, makeAmt: 1000, cond: '<', change: 500 },
      { takeAmt: 1000, makeAmt: 500, cond: '>', change: 0 },
    ];

    tests.forEach((test) => {
      describe(`take ${test.cond} order value`, () => {
        const pre = { taker: {}, maker: {} };
        before('Setup order', async () => {
          pre.taker.mln = await mlnToken.balanceOf(taker);
          pre.taker.eth = await ethToken.balanceOf(taker);
          pre.maker.mln = await mlnToken.balanceOf(maker);
          pre.maker.eth = await ethToken.balanceOf(maker);
          await mlnToken.approve(adapter.address, test.makeAmt, { from: maker });
          await adapter.makeOrder(
            mlnToken.address, ethToken.address, test.makeAmt, test.makeAmt, { from: maker },
          );
        });

        it('calls without error, where appropriate', async () => {
          console.log('BEFORE:');
          gg = await mlnToken.balanceOf(maker);
          console.log(gg);
          gg = await ethToken.balanceOf(maker);
          console.log(gg);
          gg = await mlnToken.balanceOf(taker);
          console.log(gg);
          gg = await ethToken.balanceOf(taker);
          console.log(gg);
          gg = await mlnToken.balanceOf(adapter.address);
          console.log(gg);
          gg = await ethToken.balanceOf(adapter.address);
          console.log(gg);
          const oid = await adapter.getLastOrderId();
          assert(adapter.isActive(oid));
          await ethToken.approve(adapter.address, test.takeAmt, { from: taker });
          if (test.cond === '>') {
            try {
              await adapter.takeOrder(oid, test.takeAmt, { from: taker })
              assert(false, 'No error thrown');
            } catch (e) {
              const e1 = e.message.indexOf('invalid opcode') !== -1;
              const e2 = e.message.indexOf('invalid JUMP') !== -1;
              if (!e1 && !e2) assert(false, 'Unexpected error message');
              else assert(true);
            }
          } else {
            await adapter.takeOrder(oid, test.takeAmt, { from: taker })
          }
          console.log('AFTER:');
          gg = await mlnToken.balanceOf(maker);
          console.log(gg);
          gg = await ethToken.balanceOf(maker);
          console.log(gg);
          gg = await mlnToken.balanceOf(taker);
          console.log(gg);
          gg = await ethToken.balanceOf(taker);
          console.log(gg);
          gg = await mlnToken.balanceOf(adapter.address);
          console.log(gg);
          gg = await ethToken.balanceOf(adapter.address);
          console.log(gg);
        });

        it('deactivates order, if filled', async () => {
          const oid = await adapter.getLastOrderId();
          const active = await adapter.isActive(oid);
          if (test.cond === '==') {
            assert.isFalse(active);
          } else {
            assert.isTrue(active);
            await adapter.cancelOrder(oid, { from: maker }); // cancel to return mln
          }
        });

        it('moves funds correctly', async () => {
          const post = { taker: {}, maker: {} };
          post.taker.mln = await mlnToken.balanceOf(taker);
          post.taker.eth = await ethToken.balanceOf(taker);
          post.maker.mln = await mlnToken.balanceOf(maker);
          post.maker.eth = await ethToken.balanceOf(maker);
          assert.equal(post.taker.mln.toNumber(), pre.taker.mln.toNumber() + test.change);
          assert.equal(post.taker.eth.toNumber(), pre.taker.eth.toNumber() - test.change);
          assert.equal(post.maker.mln.toNumber(), pre.maker.mln.toNumber() - test.change);
          assert.equal(post.maker.eth.toNumber(), pre.maker.eth.toNumber() + test.change);
        });
      });
    });
  });
});
