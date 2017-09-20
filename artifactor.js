// read artifacts (abi, bin, addresses) and write addresses
const api = require('./api.js').getApi();
const conf = require('./conf.js');
const fs = require('fs');
const klawSync = require('klaw-sync');
const path = require('path');

let artifacts;

// get artifacts from file
function load() {
  if(typeof artifacts !== 'object') {
    if(fs.existsSync(conf.artifacts))
      artifacts = JSON.parse(fs.readFileSync(conf.artifacts))
    else artifacts = {};
  }
  return artifacts;
}

// write artifacts to file
function save(artifacts) {
  fs.writeFileSync(conf.artifacts, JSON.stringify(artifacts))
}

// returns content of a contract json file as Object
function getSolcOutput(contract) {
  const reJson = new RegExp(`.*\/${contract}\.sol.json$`);
  const reSol = new RegExp(`.*\/?${contract}\.sol$`);
  const filePath = klawSync(conf.output, {filter: f => f.path.match(reJson)})[0].path;
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


// retrieve a contract's artifact object from loaded artifacts
function getAddress(name, network) {
  if(typeof artifacts !== 'object') artifacts = load();
  return artifacts[network][name];
}

// retrieve a parity.js contract abstraction
function getContract(name) {
  const abi = getAbi(name);
  return api.newContract(abi);
}

// retrieve a parity.js contract abstraction connected to a deployed contract
function getLiveContract(name, network) {
  const addr = getArtifact(name, network);
  const abi = getAbi(name);
  return api.newContract(abi, addr);
}

module.exports = {
  load,
  save,
  getAbi,
  getBytecode,
  getAddress,
  getContract,
  getLiveContract
}
