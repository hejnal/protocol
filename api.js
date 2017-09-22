// get parity/eth API as js module
// RPC calls detailed here: github.com/paritytech/parity/wiki/JSONRPC
const ParityApi = require('@parity/parity.js').Api;
const Web3 = require('web3');
let parityApi;
let web3;

function getParityApi() {
  if(typeof parityApi === 'undefined') {
    parityApi = new ParityApi(ParityApi.Transport.Http('http://localhost:8545'));
  }
  return parityApi;
}

function getWeb3Api() {
  if(typeof web3 === 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  return web3;
}

module.exports = {
  getParityApi,
  getWeb3Api
}
