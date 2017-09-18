const fs = require('fs');
const path = require('path');

const Api = require('@parity/parity.js').Api;
const transport = new Api.Transport.Http('http://localhost:8545');
const api = new Api(transport);

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
function retrieveArtifact(name, network) {
  if(typeof artifacts !== 'object') artifacts = load();
  return artifacts[network][name];
}

// retrieve a parity.js contract abstraction connected to a deployed contract
function retrieveContract(name, network) {
  const addr = retrieveArtifact(name, network);
  const abi = fs.readFileSync(path.join(abiDir, name + '.abi'));
  return api.newContract(abi, addr);
}

module.exports = {
  load,
  save,
  retrieveArtifact,
  retrieveContract
}
