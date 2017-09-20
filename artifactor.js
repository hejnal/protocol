const api = require('./api.js').getApi();
const fs = require('fs');
const path = require('path');

const artifactHandle = path.join(__dirname, 'artifacts.json');

let artifacts;

// TODO: make artifactor deal with .abi and .bin files as well

// get artifacts from file
function load() {
  if(typeof artifacts !== 'object') {
    if(fs.existsSync(artifactHandle))
      artifacts = JSON.parse(fs.readFileSync(artifactHandle))
    else artifacts = {};
  }
  return artifacts;
}

function save(artifacts) {
  fs.writeFileSync(artifactHandle, JSON.stringify(artifacts))
}

// retrieve a contract's artifact object from loaded artifacts
function getArtifact(name, network) {
  if(typeof artifacts !== 'object') artifacts = load();
  return artifacts[network][name];
}

// retrieve a parity.js contract abstraction connected to a deployed contract
function getContract(name, network) {
  const addr = getArtifact(name, network);
  const abi = fs.readFileSync(path.join(abiDir, name + '.abi'));
  return api.newContract(abi, addr);
}

module.exports = {
  load,
  save,
  getArtifact,
  getContract
}
