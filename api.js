const Api = require('@parity/parity.js').Api;
let api;

function getApi() {
  if(typeof api !== 'undefined') return api;
  else {
    const transport = new Api.Transport.Http('http://localhost:8545');
    api = new Api(transport);
    return api;
  }
}

module.exports = {
  getApi
}
