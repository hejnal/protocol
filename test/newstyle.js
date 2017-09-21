import 'babel-polyfill';

const api = require('../api.js').getApi();
const deployer = require('../deployer');

describe('Assets', () => {
  let mlnToken;
  beforeAll(async () => {
    mlnToken = await deployer.deploy('PreminedAsset', ['Melon', 'MLN-T', 18, 10 ** 28]);
    console.log('abc');
  });

  it('Should have correct amount of premined tokens', async () => {
    expect(await mlnToken.balanceOf(accounts[0]).toNumber()).toEqual(10 ** 28);
  });
});
