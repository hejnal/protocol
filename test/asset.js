const api = require('../api.js').getApi();

const accounts = await api.eth.accounts();

describe('Assets', () => {
  let ethToken;
  let mlnToken;
  let PREMINED = Math.pow(10, 28);
  const amt = 100000;
  const user = accounts[1];

  beforeAll(async () => {
    ethToken = await deployer.deploy('EtherToken');
    mlnToken = await deployer.deploy('PreminedAsset', [mln.name, mln.symbol, mln.decimals, PREMINED]);
  });
  it('should have correct amount of premined tokens', async () => {
    expect(await mlnToken.balanceOf(accounts[0])).toEqual(PREMINED);
  });
  it('allows deposit', async () => {
    const initialBal = await ethToken.balanceOf(user);
    await ethToken.deposit({ from: user, value: amt });
    const newBal = await ethToken.balanceOf(user);
    expect(newBal.toNumber()).toEqual(initialBal + amt);
  });
  it('allows withdrawal', async () => {
    const initialBal = await ethToken.balanceOf(user);
    await ethToken.withdraw(amt, { from: user });
    const newBal = await ethToken.balanceOf(user);
    expect(newBal.toNumber()).toEqual(initialBal.toNumber() - amt);
  });
});
