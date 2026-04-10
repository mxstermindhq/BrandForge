const { AsyncLocalStorage } = require('async_hooks');

const apiContext = new AsyncLocalStorage();

function runApiRequest(context, fn) {
  return apiContext.run(context, fn);
}

function getApiCorsHeaders() {
  return apiContext.getStore()?.corsHeaders || {};
}

module.exports = { apiContext, runApiRequest, getApiCorsHeaders };
