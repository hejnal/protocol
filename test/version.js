const api = require('../api.js').getApi();

const accounts = await api.eth.accounts();

describe('Version', () => {
  let version;
  let feed;

  beforeAll(async () => {
    const ethToken = await deployer.deploy('EtherToken');
    const eurToken = await deployer.deploy('PreminedAsset',
      ['Euro', 'EUR', 8, 10 ** 18, { from: accounts[0] }]
    );
    const mlnToken = await deployer.deploy('PreminedAsset',
      ['Melon', 'MLN', 18, 10 ** 18, { from: accounts[0] }]
    );
    const version = await deployer.deploy('Version', mlnToken.address);
    const feed = await deployer.deploy('DataFeed', mlnToken.address, 0, 120);
    const someBytes = '0x86b5eed81db5f691c36cc83eb58cb5205bd2090bf3763a19f0c5bf2f074dd84b';
    await feed.register(mlnToken.address, '', '', 18, '', someBytes, someBytes, accounts[9], accounts[9]);
    await feed.update([mlnToken.address], [226244343891402714]);
    exchange = await deployer.deploy('Exchange');
    sphere = await deployer.deploy('Sphere', [feed.address, exchange.address]);
    participation = await deployer.deploy('Participation');
    riskManagement = await deployer.deploy('RiskMgmt');
  });

  it('Can create a vault without error', async () => {
    await version.setupVault(
      'Cantaloot',    // name
      'CNLT',         // share symbol
      18,             // share decimals
      participation.address,
      riskManagement.address,
      sphere.address,
      { from: accounts[6], gas: 6713095 }
    );
  });

  it('Can retrieve vault from index', async () => {
    let vaultId = await version.getLastVaultId();
    expect(vaultId.toNumber()).toEqual(0);
  });

  it('Can remove a vault', async () => {
    let vaultId = await version.getLastVaultId();
    await version.shutDownVault(vaultId);
  });
});
