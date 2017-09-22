// provides a way to deploy and link contracts
const web3 = require('./api.js').getWeb3Api();
const artifactor = require('./artifactor');
const conf = require('./conf.js');
const solc = require('solc');

// contract name and filename needs to have same case-sensitive name
function deploy(name, constructorArgs, opts) {
  console.log(`Deploying ${name}`);
  if(constructorArgs === undefined) constructorArgs = [];
  const abi = artifactor.getAbi(name);
  const bytecode = artifactor.getBytecode(name);
  const contract = new web3.eth.Contract(abi);
  return contract.deploy({data: '0x' + bytecode, arguments: constructorArgs}).send(opts);
}

//XXX: link using this until dapp does it by default (dapphub/dapp#55)
function link(libName, toContractName) {
  const libAddr = artifactor.getAddress(libName, conf.network);
  let bytecode = artifactor.getBytecode(toContractName);
  const libs = {};
  libs[libName] = libAddr;
  bytecode = solc.linkBytecode(bytecode, libs);
}

module.exports = {
  deploy,
  link
}
