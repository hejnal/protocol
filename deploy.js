#!/usr/bin/env node

const artifactor = require('./artifactor.js');
const conf = require('./conf.js');    // TODO: specify alternative confs as CLI input?
const deployer = require('./deployer.js');
const tokenInfo = require('./migrations/config/token_info.js');

function main() {
  //addressBook = artifacts[NETWORK];
  if(conf.network === 'kovan') {
    let artifacts = artifactor.load();
    const mlnAddr = tokenInfo[conf.network].find(t => t.symbol === 'MLN-T').address;
    deployer.link('Vault', 'rewards');
    deployer.deploy('DataFeed', [mlnAddr, 120, 60])
    .then(address => {addressBook['DataFeed'] = address})
    .then(() => deployer.deploy('SimpleMarket'))
    .then(address => {addressBook['SimpleMarket'] = address})
    .then(() => deployer.deploy('Sphere', [addressBook.DataFeed, addressBook.SimpleMarket]))
    .then(address => {addressBook['Sphere'] = address})
    .then(() => deployer.deploy('Participation'))
    .then(address => {addressBook['Participation'] = address})
    .then(() => deployer.deploy('RMMakeOrders'))
    .then(address => {addressBook['RMMakeOrders'] = address})
    .then(() => deployer.deploy('Governance'))
    .then(address => {addressBook['Governance'] = address})
    .then(() => deployer.deploy('calculate'))
    .then(address => {addressBook['calculate'] = address})
    .then(() => deployer.deploy('rewards'))
    .then(address => {addressBook['rewards'] = address})
    // TODO: link libraries with Vault and Version
    .then(() => {
      artifacts[conf.network] = addressBook;
      artifactor.save(artifacts);
    })
  }
}

if(require.main === module) {
  main();
}
