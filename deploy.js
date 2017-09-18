#!/usr/bin/env node

//LOGIC

//for each contract:
// get the contract ABI and bytecode
// deploy the contract
// add to the artifact object
//then:
// modify the artifacts file

const path = require('path');
const fs = require('fs');
const tokenInfo = require('./migrations/config/token_info.js');
const Api = require('@parity/parity.js').Api;
const transport = new Api.Transport.Http('http://localhost:8545');
const api = new Api(transport);

const abiDir = path.join(__dirname, 'out');
const artifactHandle = path.join(__dirname, 'artifacts.json');


function loadArtifacts() {
  if(fs.existsSync(artifactHandle))
    return JSON.parse(fs.readFileSync(artifactHandle))
  else return {};
}

// contract name and filename needs to have same case-sensitive name
function deployContract(name, args) {
  if(args === undefined) args = []; //TODO: make below line find in subdirs as well
  const abi = JSON.parse(fs.readFileSync(path.join(abiDir, name + '.abi'), 'utf8'));
  const bytecode = fs.readFileSync(path.join(abiDir, name + '.bin'), 'utf8');
  const contract = api.newContract(abi);
  debugger; //XXX: below line will throw until paritytech/parity#6540 is resolved
  return contract.deploy({data: bytecode}, args);
}

function main() {
  let artifacts = loadArtifacts();
  const mlnAddr = tokenInfo['kovan'].find(t => t.symbol === 'MLN-T').address;
  deployContract('datafeeds/DataFeed', [mlnAddr, 120, 60])
  .then(address => {artifacts.kovan['DataFeed'] = address})
  .then(() => fs.writeFileSync(artifactHandle, JSON.stringify(artifacts)))
}

main();
