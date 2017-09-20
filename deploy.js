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

// returns content of a contract file as Object
function getSolcOutput(contract) {
  const reJson = new RegExp(`.*\/${contract}\.sol.json$`);
  const reSol = new RegExp(`.*\/?${contract}\.sol$`);
  const filePath = klawSync(outDir, {filter: f => f.path.match(reJson)})[0].path;
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const sourcepath = content.sourceList.filter(e => e.match(reSol))[0];
  return content.contracts[`${sourcepath}:${contract}`];
}

// returns string
function getBytecode(contract) {
  return getSolcOutput(contract).bin;
}

// returns Object
function getAbi(contract) {
  return JSON.parse(getSolcOutput(contract).abi);
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
  const libAddr = artifactor.getArtifact(toContract, NETWORK);
  let bytecode = getBytecode(fromContract);
  const libs = {};
  libs[toContract] = libAddr;
  bytecode = solc.linkBytecode(bytecode, libs);
}

function main() {
  addressBook = artifacts[NETWORK];
  if(NETWORK === 'kovan') {
    let artifacts = artifactor.load();
    const mlnAddr = tokenInfo[NETWORK].find(t => t.symbol === 'MLN-T').address;
    link('Vault', 'rewards');
    deployContract('DataFeed', [mlnAddr, 120, 60])
    .then(address => {addressBook['DataFeed'] = address})
    .then(() => deployContract('SimpleMarket'))
    .then(address => {addressBook['SimpleMarket'] = address})
    .then(() => deployContract('Sphere', [addressBook.DataFeed, addressBook.SimpleMarket]))
    .then(address => {addressBook['Sphere'] = address})
    .then(() => deployContract('Participation'))
    .then(address => {addressBook['Participation'] = address})
    .then(() => deployContract('RMMakeOrders'))
    .then(address => {addressBook['RMMakeOrders'] = address})
    .then(() => deployContract('Governance'))
    .then(address => {addressBook['Governance'] = address})
    .then(() => deployContract('calculate'))
    .then(address => {addressBook['calculate'] = address})
    .then(() => deployContract('rewards'))
    .then(address => {addressBook['rewards'] = address})
    .then(() => deployContract('rewards'))
    .then(address => {addressBook['rewards'] = address})
    // TODO: link libraries with Vault and Version
    .then(() => {
      artifacts[NETWORK] = addressBook;
      artifactor.save(artifacts);
    })
  }
}

if(require.main === module) {
  main();
}
