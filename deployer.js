const api = require('./api.js').getApi();
const artifactor = require('./artifactor');
const conf = require('./conf.js');
const fs = require('fs');
const klawSync = require('klaw-sync');
const path = require('path');

const outDir = path.join(__dirname, 'out');

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
function deploy(name, args) {
  if(args === undefined) args = [];
  const abi = getAbi(name);
  const bytecode = getBytecode(name);
  const contract = api.newContract(abi);
  return contract.deploy({data: bytecode}, args);
}

//XXX: link using this until dapp does it by default (dapphub/dapp#55)
function link(fromContract, toContract) {
  const libAddr = artifactor.getArtifact(toContract, conf.network);
  let bytecode = getBytecode(fromContract);
  const libs = {};
  libs[toContract] = libAddr;
  bytecode = solc.linkBytecode(bytecode, libs);
}

module.exports = {
  getAbi,
  getBytecode,
  deploy,
  link
}
