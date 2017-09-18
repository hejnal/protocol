const path = require('path');
const fs = require('fs');

const artifactHandle = path.join(__dirname, 'artifacts.json');

let artifacts;

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

// retrieve a contract object from loaded artifacts
function retrieveContract(name, network) {
  if(typeof artifacts !== 'object') artifacts = load();
  return artifacts[network][name];
}

module.exports = {
  load,
  save,
  retrieveContract
}
