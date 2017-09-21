// get parity/eth API as js module
// RPC calls detailed here: github.com/paritytech/parity/wiki/JSONRPC
//const ParityApi = require('@parity/api');
const ParityApi = require('@parity/parity.js').Api;
let parityApi;

function getApi() {
  if(typeof parityApi !== 'undefined') return parityApi;
  else {
    //const transport = new ParityApi.Provider.Http('http://localhost:8545');
    const transport = new ParityApi.Transport.Http('http://localhost:8545');
    parityApi = new ParityApi(transport);
    return parityApi;
  }
}

module.exports = {
  getApi
}
