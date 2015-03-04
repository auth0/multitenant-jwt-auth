var jwt = require('jsonwebtoken');
var tenants = require('./tenants');

var tokens = module.exports = {};

// tenant_1 tokens
var tenant_1 = tenants.tenant_1;

tokens.tenant_1 = {
  token_1: jwt.sign({ aud: tenant_1.id, jti: 'token_1', scopes: [ 'read_users' ]}, tenant_1.secret),
  token_2: jwt.sign({ aud: tenant_1.id, jti: 'token_2', scopes: [ 'read_users' ]}, tenant_1.secret)
};

// tenant_2 tokens
var tenant_2 = tenants.tenant_2;

tokens.tenant_2 = {
  token_1: jwt.sign({ aud: tenant_2.id, jti: 'token_1', scopes: [ 'update_users' ]}, tenant_2.secret),
  token_2: jwt.sign({ aud: tenant_2.id, jti: 'token_2', scopes: [ 'update_users' ]}, tenant_2.secret)
};