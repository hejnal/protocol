const artifactor = require('./artifactor.js');
const conf = require('./conf.js');    // TODO: specify alternative confs as CLI input?
const deployer = require('./deployer.js');
const tokenInfo = require('./migrations/config/token_info.js');
const web3 = require('./api').getWeb3Api();

async function main() {
  const accounts = await web3.eth.getAccounts();
  const opts = {from: accounts[0], gas: 7000000};
  //addressBook = artifacts[NETWORK];
  if(conf.network === 'kovan') {
    try { // TODO: clean up below lines with default options and automatic address storing
      let artifacts = artifactor.load();
      let addressBook = artifacts;
      const mlnAddr = tokenInfo[conf.network].find(t => t.symbol === 'MLN-T').address;
      const datafeed = await deployer.deploy('DataFeed', [mlnAddr, 120, 60], opts);
      addressBook['DataFeed'] = datafeed._address;
      const simpleMarket = await deployer.deploy('SimpleMarket', [], opts)
      addressBook['SimpleMarket'] = simpleMarket._address;
      const sphere = await deployer.deploy('Sphere', [addressBook.DataFeed._address, addressBook.SimpleMarket._address], opts)
      addressBook['Sphere'] = sphere._address;
      const participation = await deployer.deploy('Participation', [], opts);
      addressBook['Participation'] = participation._address;
      const riskMgmt = await deployer.deploy('RMMakeOrders', [], opts);
      addressBook['RMMakeOrders'] = riskMgmt._address;
      const governance = await deployer.deploy('Governance', [mlnAddr], opts);
      addressBook['Governance'] = governance._address;
      const rewards = await deployer.deploy('rewards', [], opts);
      addressBook['rewards'] = rewards._address;
      const simpleAdapter = await deployer.deploy('simpleAdapter', [], opts);
      addressBook['simpleAdapter'] = simpleAdapter._address;
      deployer.link('rewards', rewards._address, 'Fund');
      deployer.link('simpleAdapter', simpleAdapter._address, 'Fund');
      deployer.link('rewards', rewards._address, 'Version');
      deployer.link('simpleAdapter', simpleAdapter._address, 'Version');
      const version = await deployer.deploy('Version', [mlnAddr], opts);
      addressBook['Version'] = version._address;
      // TODO: register assets
      //artifacts[conf.network] = addressBook;
      //artifactor.save(artifacts);
    } catch (err) {
      console.log(err.stack);
    }
  }
}

if(require.main === module) {
  main();
}
