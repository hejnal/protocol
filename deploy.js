const artifactor = require('./artifactor.js');
const conf = require('./conf.js');    // TODO: specify alternative confs as CLI input?
const deployer = require('./deployer.js');
const tokenInfo = require('./migrations/config/token_info.js');

async function main() {
  //addressBook = artifacts[NETWORK];
  if(conf.network === 'kovan') {
    let artifacts = artifactor.load();
    const mlnAddr = tokenInfo[conf.network].find(t => t.symbol === 'MLN-T').address;
    //deployer.link('Vault', 'rewards');
    addressBook['DataFeed'] = await deployer.deploy('DataFeed', [mlnAddr, 120, 60]);
    addressBook['SimpleMarket'] = await deployer.deploy('SimpleMarket')
    addressBook['Sphere'] = await deployer.deploy('Sphere', [addressBook.DataFeed, addressBook.SimpleMarket])
    addressBook['Participation'] = await deployer.deploy('Participation');
    addressBook['RMMakeOrders'] = await deployer.deploy('RMMakeOrders');
    addressBook['Governance'] = await deployer.deploy('Governance');
    addressBook['calculate'] = await deployer.deploy('calculate');
    addressBook['rewards'] = await deployer.deploy('rewards');
    // TODO: link libraries with Vault and Version
    // TODO: register assets
    artifacts[conf.network] = addressBook;
    artifactor.save(artifacts);
  }
}

if(require.main === module) {
  main();
}
