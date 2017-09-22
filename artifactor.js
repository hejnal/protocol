// read artifacts (abi, bin, addresses) and write addresses
const web3 = require('./api.js').getWeb3Api();
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

// returns path for a contract name
function getPathForContract(name) {
  const reJson = new RegExp(`.*\/${name}\.sol.json$`);
  return klawSync(conf.output, {filter: f => f.path.match(reJson)})[0].path;
}

// returns content of a contract json file as Object
function getSolcOutput(contractName) {
  const filePath = getPathForContract(contractName);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const reSol = new RegExp(`.*\/?${contractName}\.sol$`);
  const sourcepath = content.sourceList.filter(e => e.match(reSol))[0];
  return content.contracts[`${sourcepath}:${contractName}`];
}

// returns string
function getBytecode(contract) {
  return getSolcOutput(contract).bin;
}

// change the bytecode in the contract's JSON file (used for linking libs)
function setBytecode(contractName, bytecode) {
  const filepath = getPathForContract(contractName);
  const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const reSol = new RegExp(`.*\/?${contractName}\.sol$`);
  const sourcepath = content.sourceList.filter(e => e.match(reSol))[0];
  content.contracts[`${sourcepath}:${contractName}`].bin = bytecode;
  fs.writeFileSync(filepath, JSON.stringify(content));
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

// retrieve a parity.js contract abstraction, not connected to any deployment
function getContract(name) {
  const abi = getAbi(name);
  return web3.newContract(abi);
}

// retrieve a parity.js contract abstraction connected to a deployed contract
function getLiveContract(name, network) {
  const addr = getAddress(name, network);
  const abi = getAbi(name);
  return web3.newContract(abi, addr);
}

module.exports = {
  load,
  save,
  getAbi,
  getBytecode,
  setBytecode,
  getAddress,
  getContract,
  getLiveContract,
  getSolcOutput,
  getPathForContract
}
