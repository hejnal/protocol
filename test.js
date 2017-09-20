const api = require('./api.js').getApi();
const artifactor = require('./artifactor.js');
const chai = require('chai');
const deployer = require('./deployer');

const net = 'test';

describe('Assets', () => {
  let mlnToken;
  before('Deploy asset', () => {
    return deployer.deploy('PreminedAsset', ['Melon', 'MLN-T', 18, 10 ** 28])
    .then(() => console.log('abc'))
  });

  it.skip('Should have correct amount of premined tokens', () => {
  });
});
