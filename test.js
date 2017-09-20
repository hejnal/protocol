import 'babel-polyfill';

const api = require('./api.js').getApi();
const artifactor = require('./artifactor.js');
const chai = require('chai');
const deployer = require('./deployer');

const net = 'test';

describe('Assets', () => {
  let mlnToken;
  before('Deploy asset', async () => {
    mlnToken = await deployer.deploy('PreminedAsset', ['Melon', 'MLN-T', 18, 10 ** 28]);
    console.log('abc');
  });

  it.skip('Should have correct amount of premined tokens', async () => {
    assert.equal(await mlnToken.balanceOf(accounts[0]), PREMINED)
  });
});
