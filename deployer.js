const api = require('./api.js').getApi();
const artifactor = require('./artifactor');
const conf = require('./conf.js');
const solc = require('solc');

// contract name and filename needs to have same case-sensitive name
function deploy(name, args) {
  if(args === undefined) args = [];
  const abi = artifactor.getAbi(name);
  const bytecode = artifactor.getBytecode(name);
  const contract = api.newContract(abi);
  return contract.deploy({data: bytecode}, args);
}

//XXX: link using this until dapp does it by default (dapphub/dapp#55)
function link(fromContract, toContract) {
  const libAddr = artifactor.getAddress(toContract, conf.network);
  let bytecode = artifactor.getBytecode(fromContract);
  const libs = {};
  libs[toContract] = libAddr;
  bytecode = solc.linkBytecode(bytecode, libs);
}

module.exports = {
  deploy,
  link
}
