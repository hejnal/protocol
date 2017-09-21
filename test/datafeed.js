const api = require('../api.js').getApi();

const accounts = await api.eth.accounts();

describe('DataFeed', () => {
  let feed;
  let btc;
  let eth;
  beforeAll(async () => {
    btc = await deployer.deploy('Asset', ['Bitcoin Token', 'BTC-T', 18]);
    eth = await deployer.deploy('Asset', ['Ether Token', 'ETH-T', 18]);
    feed = await deployer.deploy('DataFeed');
  });
  describe('AssetRegistrar', () => {
    const someBytes = '0x86b5eed81db5f691c36cc83eb58cb5205bd2090bf3763a19f0c5bf2f074dd84b';
    it('registers twice without error', async () => {   // using accts as fake addrs
      await feed.register(btc.address, 'Bitcoin', 'BTC', 18, 'bitcoin.org',
        someBytes, someBytes, accounts[5], accounts[6], {from: accounts[0]}); 
      await feed.register(eth.address, 'Ethereum', 'ETH', 18, 'ethereum.org',
        someBytes, someBytes, accounts[7], accounts[8], {from: accounts[0]});
    });
    it('gets descriptive information', async () => {
      [name, sym, decimals, url, hash] = await feed.getDescriptiveInformation(btc.address);
      expect(name).toEqual('Bitcoin');
      expect(sym).toEqual('BTC');
      expect(decimals).toEqual(18);
      expect(url).toEqual('bitcoin.org');
      expect(hash).toEqual(someBytes);
    });
    it('gets specific information', async () => {
      [decimals, , breakIn, breakOut] = await feed.getSpecificInformation(btc.address);
      expect(decimals).toEqual(18);
      expect(breakIn).toEqual(accounts[5]);
      expect(breakOut).toEqual(accounts[6]);
    });
  });
  describe('DataFeed', () => {
    let assetA;
    let assetB;
    it('can get assets', async () => {
      quoteAsset = await feed.getQuoteAsset();
      numAssets = await feed.numRegisteredAssets();
      expect(numAssets.toNumber()).toEqual(2);
      assetA = await feed.getRegisteredAssetAt(0);
      assetB = await feed.getRegisteredAssetAt(1);
    });
    it('registers pricefeed update', async () => {
      await feed.update([assetA, assetB], [500, 2000]);
      const newUid = await feed.getLastUpdateId();
      expect(newUid.toNumber()).toEqual(0);
    });
    it('price updates are valid', async () => {
      validA = await feed.isValid(assetA);
      validB = await feed.isValid(assetB);
      expect(validA).toBe(true);
      expect(validB).toBe(true);
    });
    it('price updates are correct', async () => {
      [timeA, priceA] = await feed.getData(assetA);
      [timeB, priceB] = await feed.getData(assetB);
      priceB2 = await feed.getPrice(assetB);
      expect(priceA.toNumber()).toEqual(500);
      expect(priceB.toNumber()).toEqual(2000);
      expect(priceB.toNumber()).toEqual(priceB2.toNumber());
      expect(timeA.toNumber()).toEqual(timeB.toNumber());
    });
    it('returns first chunk of data history for first asset', async () => {
      [timesA, pricesA] = await feed.getDataHistory(assetA, 0);
      expect(timesA[0].toNumber()).not.toEqual(0);
      expect(pricesA[0].toNumber()).not.toEqual(0);
    });
    it('returns first chunk of data history for second asset', async () => {
      [timesB, pricesB] = await feed.getDataHistory(assetB, 0);
      expect(timesB[0].toNumber()).not.toEqual(0);
      expect(pricesB[0].toNumber()).not.toEqual(0);
    });
  });
});
