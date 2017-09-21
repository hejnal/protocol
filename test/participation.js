const api = require('../api.js').getApi();

const accounts = await api.eth.accounts();

describe('Participation', () => {
  let ptcp;
  beforeAll(async () => {
    ptcp = deployer.deploy('Participation');
  });
  it('account is not permitted to subscribe if it was never listed', async () => {
    const res = await ptcp.isSubscribeRequestPermitted(accounts[9], 10, 20);
    expect(res).toBe(false);
  });
  it('account is permitted to subscribe after listing', async () => {
    ptcp.list(accounts[1]);
    const res = await ptcp.isSubscribeRequestPermitted(accounts[1], 10, 20);
    expect(res).toBe(true);
  });
  it('listing multiple accounts permits them all to subscribe', async () => {
    await ptcp.bulkList([accounts[2], accounts[3], accounts[4], accounts[5]]);
    const allRes = await Promise.all([2, 3, 4, 5].map(ii =>
      ptcp.isSubscribeRequestPermitted(accounts[ii], 10, 20)
    ));
    expect(allRes).not.toContain(false);
  });
  it('delisting removes subscribe permissions', async () => {
    let res = await ptcp.isSubscribeRequestPermitted(accounts[1], 10, 20);
    expect(res).toBe(true);
    await ptcp.delist(accounts[1]);
    res = await ptcp.isSubscribeRequestPermitted(accounts[1], 10, 20);
    expect(res).not.toBe(true);
  });
  it('redeem request is always allowed', async () => {
    const res = await ptcp.isRedeemRequestPermitted(accounts[9], 10, 20);
    expect(res).toBe(true);
  });
});
