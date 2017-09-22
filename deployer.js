// provides a way to deploy and link contracts
const web3 = require('./api.js').getWeb3Api();
const artifactor = require('./artifactor');
const conf = require('./conf.js');
const path = require('path');
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

// XXX: assumes src/ and out/ and directories for contracts and compilation artifacts
function getPlaceholder(libName) {
  const inPath = artifactor.getPathForContract(libName);
  let truncatedPath = inPath.replace(new RegExp('.*/out/'), 'src/');
  truncatedPath = truncatedPath.replace('.json', '');
  const appended = truncatedPath + ':' + libName;
  return appended.slice(0, 36);
}

//XXX: link using this until dapp does it by default (dapphub/dapp#55)
// returns bytecode with linked address(es)
function link(libName, libAddr, toContractName) {
  //const libAddr = artifactor.getAddress(libName, conf.network);
  console.log(`Linking ${libName} to ${toContractName}`);
  const libPath = artifactor.getPathForContract(libName);
  const mykey = libPath + ':' + libName;
  const libs = {};
  libs[getPlaceholder(libName)] = libAddr;
  console.log(libs);
  let bytecode = artifactor.getBytecode(toContractName);
  bytecode = solc.linkBytecode(bytecode, libs);
  artifactor.setBytecode(toContractName, bytecode);
}

module.exports = {
  deploy,
  link
}
