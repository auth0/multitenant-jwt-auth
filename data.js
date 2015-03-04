var tenants = require('./tenants');
var tokenBlacklist = require('./tokenBlacklist');
var users = require('./users');
var data = module.exports = {};

data.getTenantByIdentifier = function(identifier, done){
  return done(null, tenants[identifier]);
};

data.getRevokedTokenByIdentifier = function(tokenIdentifier, done){
  return done(null, tokenBlacklist[tokenIdentifier]);
};

data.getUsersByTenantIdentifier = function(identifier, done){
  return done(null, users[identifier]);
};