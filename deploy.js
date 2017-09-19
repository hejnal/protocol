#!/usr/bin/env node

//LOGIC

//for each contract:
// get the contract ABI and bytecode
// deploy the contract
// add to the artifact object
//then:
// modify the artifacts file

const artifactor = require('./artifactor.js');
const fs = require('fs');
const klawSync = require('klaw-sync');
const path = require('path');
const solc = require('solc');
const tokenInfo = require('./migrations/config/token_info.js');
const Api = require('@parity/parity.js').Api;
const transport = new Api.Transport.Http('http://localhost:8545');
const api = new Api(transport);

const outDir = path.join(__dirname, 'out');
const NETWORK = 'kovan';

// returns path to the contract file defined by regexp
// TODO: watch for case where Dapp outputs files in weird subdirs (is it possible to catch?)
function getFileContent(regexp){
  const filePath = klawSync(outDir, {filter: f => f.path.match(regexp)})[0];
  return fs.readFileSync(filePath, 'utf8');
}

// returns string
function getBytecode(contract) {
  const re = new RegExp(`.*${contract}\.bin$`);
  return getFileContent(re);
}

// returns Object
function getAbi(contract) {
  const re = new RegExp(`.*${contract}\.abi$`);
  return JSON.parse(getFileContent(re));
}

// contract name and filename needs to have same case-sensitive name
function deployContract(name, args) {
  if(args === undefined) args = [];
  const abi = getAbi(name);
  const bytecode = getBytecode(name);
  const contract = api.newContract(abi);
  return contract.deploy({data: bytecode}, args);
}

//XXX: link using this until dapp does it by default (dapphub/dapp#55)
function link(fromContract, toContract) {
  const addr = artifactor.getArtifact('rewards', NETWORK);
  let bytecode = getBytecode(fromContract);
  const libs = {};
  libs[toContract] = addr;
  bytecode = solc.linkBytecode(bytecode, libs);
  console.log(bytecode);
}

function main() {
  let artifacts = artifactor.load();
  const mlnAddr = tokenInfo[NETWORK].find(t => t.symbol === 'MLN-T').address;
  link('Vault', 'rewards');
  return;
  deployContract('datafeeds/DataFeed', [mlnAddr, 120, 60])
  .then(address => {artifacts.kovan['DataFeed'] = address})
  .then(() => deployContract('exchange/SimpleMarket'))
  .then(address => {artifacts.kovan['SimpleMarket'] = address})
  .then(() => deployContract('sphere/Sphere', [artifacts.kovan.DataFeed, artifacts.kovan.SimpleMarket]))
  .then(address => {artifacts.kovan['Sphere'] = address})
  .then(() => deployContract('participation/Participation'))
  .then(address => {artifacts.kovan['Participation'] = address})
  .then(() => deployContract('riskmgmt/RMMakeOrders'))
  .then(address => {artifacts.kovan['RMMakeOrders'] = address})
  .then(() => deployContract('governance/Governance'))
  .then(address => {artifacts.kovan['Governance'] = address})
  .then(() => deployContract('libraries/calculate'))
  .then(address => {artifacts.kovan['calculate'] = address})
  .then(() => deployContract('libraries/rewards'))
  .then(address => {artifacts.kovan['rewards'] = address})
  .then(() => deployContract('libraries/rewards'))
  .then(address => {artifacts.kovan['rewards'] = address})
  // TODO: link libraries with Vault and Version
  .then(() => artifactor.save(artifacts))
}

if(require.main === module) {
  main();
}
